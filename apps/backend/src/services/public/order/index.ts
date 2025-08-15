import { OrderStatus, ProductDeliveryType } from "@src/db/types/product";
import { CreateOrderInput } from "@src/routes/public/orders/schema";
import { BaseService } from "@src/services/baseService";
import { ChargeResponse, PaymentProvider, PaymentStatus } from "@src/services/paymentProvider/PaymentProvider";
import { BadRequestError, NotFoundError } from "@src/utils/app_error";
import * as fs from "fs";
import * as path from "path";
import * as os from "os";
import archiver from "archiver";
import { groupBy } from "lodash";
import { GetManyProductResult } from "@src/db/models/product/product.model";
import { IOrderItem } from "@src/db/models/order/orderItem.model";
import { Selectable } from "kysely";
import { GetShippingCostResult } from "@src/services/_apis/store/ExternalStore";

type FinalizeOrderInput = {
  profileId: string;
  orderId: string;
};

type GetOrderInput = {
  paymentId?: string;
  profileId: string;
  orderId?: string;
};

type ProcessOrderInput = {
  orderId: string;
};

type OrderGroup = {
  userItems: Selectable<IOrderItem>[];
  giftItems: Record<string, Selectable<IOrderItem>[]>;
};

type ArchiveResult = {
  filename: string;
  url: string;
  size: number;
};

export class OrderService extends BaseService {
  public async updateOrderStatus({ orderId, status }: { orderId: string; status: OrderStatus }) {
    await this.models.Order.updateOne({ id: orderId }, { status });
  }

  public async create(input: CreateOrderInput) {
    const productVariants = await this.models.ProductVariant.find({
      id: input.cartItems.map((item) => item.productVariantId),
    });

    let firstName = input.firstName;
    let lastName = input.lastName;

    if (input.accountId) {
      const account = await this.models.Account.findById(input.accountId);
      if (!account) {
        throw new BadRequestError("Account not found");
      }
      firstName = account.firstName;
      lastName = account.lastName;
    }

    const subTotal = input.cartItems.reduce((acc, item) => {
      const productVariant = productVariants.find((variant) => variant.id === item.productVariantId);
      if (!productVariant) {
        throw new BadRequestError("Product variant not found");
      }
      return acc + Number(productVariant.price) * item.quantity;
    }, 0);

    const status = subTotal > 0 ? OrderStatus.InitiatedPayment : OrderStatus.Paid;

    const physicalProductVariants = productVariants.filter((pv) => pv.deliveryType === ProductDeliveryType.Physical);

    let shippingCost: GetShippingCostResult = {
      shippingCost: 0,
      externalId: "",
    };

    if (physicalProductVariants.length > 0 && subTotal > 0) {
      if (!input.shippingAddress) {
        throw new BadRequestError("Shipping address is required");
      }

      const profileProductStore = await this.models.ProductStore.findOne({ profileId: input.profileId });

      if (!profileProductStore) {
        throw new BadRequestError("Profile product store not found");
      }
      const decryptedAccessToken = this.apis.encryption.decrypt(profileProductStore.accessToken);
      const storeApi = await this.apis.getExternalStore(profileProductStore.provider, decryptedAccessToken);

      shippingCost = await storeApi.getShippingCost({
        items: physicalProductVariants.map((pv) => {
          if (!pv.externalId) {
            throw new BadRequestError("Product variant external id not found");
          }
          const quantity = input.cartItems.find((item) => item.productVariantId === pv.id)?.quantity;
          if (!quantity) {
            throw new BadRequestError("Quantity not found");
          }
          return {
            productVariantId: pv.externalId,
            quantity,
          };
        }),
        recipient: {
          name: firstName + " " + lastName,
          ...input.shippingAddress,
        },
      });
    }

    const totalAmount = subTotal + shippingCost.shippingCost;
    let payment: ChargeResponse;
    let paymentProvider: PaymentProvider;

    if (totalAmount > 0) {
      paymentProvider = await this.apis.getPaymentProvider(input.profileId);
      payment = await paymentProvider.startCharge({
        amount: totalAmount,
        currency: "usd",
        email: input.email,
        returnUrl: "http://drenathan1.localhost:3001/checkout",
      });
    }

    return this.database.client.transaction().execute(async (trx) => {
      const order = await this.models.Order.insertOne(
        {
          totalAmount,
          profileId: input.profileId,
          status,
          paymentProviderName: paymentProvider?.name,
          paymentId: payment?.paymentId,
          firstName,
          lastName,
          email: input.email,
          accountId: input.accountId,
        },
        trx,
      );
      await this.models.OrderItem.insertMany(
        input.cartItems.map((item) => ({
          orderId: order.id,
          productId: item.productId,
          productVariantId: item.productVariantId,
          quantity: item.quantity,
          price: item.price,
          isGift: item.isGift,
          recipientName: item.recipientName,
          recipientEmail: item.recipientEmail,
          recipientMessage: item.recipientMessage,
          payWhatYouWant: item.payWhatYouWant,
          title: item.title,
          coverImage: item.coverImage,
        })),
        trx,
      );

      return {
        ...payment,
        orderId: order.id,
        shippingCost: shippingCost.shippingCost,
        subTotal,
        totalAmount,
      };
    });
  }

  public async finalizePayment(input: FinalizeOrderInput) {
    const order = await this.models.Order.getUserOrder({
      orderId: input.orderId,
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (order.status !== OrderStatus.InitiatedPayment) {
      return order;
    }

    if (!order.paymentId) {
      throw new BadRequestError("Invalid order");
    }

    const paymentProvider = await this.apis.getPaymentProvider(input.profileId);
    const paymentStatus = await paymentProvider.getPaymentStatus(order.paymentId);

    const status = this.getOrderStatus(paymentStatus);

    await this.database.client.transaction().execute(async (trx) => {
      await this.models.Order.updateOne({ id: order.id, profileId: input.profileId }, { status }, trx);
    });

    return this.models.Order.getUserOrder({
      orderId: order.id,
    });
  }

  public async processOrder({ orderId }: ProcessOrderInput) {
    // 1. Get the order and all order items
    const order = await this.models.Order.getUserOrder({ orderId });
    if (!order) {
      throw new NotFoundError("Order not found");
    }

    // 2. Get user details
    let userEmail: string;
    let userFirstName: string;

    if (order.accountId) {
      // Get account details
      const account = await this.models.Account.findById(order.accountId);
      userEmail = account?.email ?? order.email ?? "";
      userFirstName = account?.firstName ?? order.firstName ?? "";
    } else {
      // Use order details
      userEmail = order.email || "";
      userFirstName = order.firstName || "";
    }

    if (!userEmail || !userFirstName) {
      throw new Error("User email not found for order " + order.id);
    }

    // 3. Group order items by gift status and recipient email
    const orderGroups = this.groupOrderItems(order.items as unknown as Selectable<IOrderItem>[]);

    const userArchive = {
      archive: await this.createAndUploadArchive(orderGroups.userItems, order.id, order.profileId),
      recipientEmail: userEmail,
      recipientName: userFirstName,
      recipientMessage: null,
      isGift: false,
      items: orderGroups.userItems,
    };

    const giftArchives = await Promise.all(
      Object.values(orderGroups.giftItems).map(async (items) => {
        const archive = await this.createAndUploadArchive(items, order.id, order.profileId);
        return {
          archive,
          recipientEmail: items[0].recipientEmail!,
          recipientName: items[0].recipientName!,
          recipientMessage: items[0].recipientMessage,
          isGift: true,
          senderName: userFirstName,
          senderEmail: userEmail,
          items,
        };
      }),
    );

    // TODO: save the archives details in the database

    return {
      order: {
        profileId: order.profileId,
        orderId: order.id,
        totalAmount: order.totalAmount,
        date: order.createdAt as unknown as string,
      },
      archives: [userArchive, ...giftArchives],
    };
  }

  private groupOrderItems(items: Selectable<IOrderItem>[]): OrderGroup {
    const userItems = items.filter((item) => !item.isGift);
    const giftItems = groupBy(
      items.filter((item) => item.isGift),
      "recipientEmail",
    );

    return {
      userItems,
      giftItems,
    };
  }

  private async createAndUploadArchive(
    group: Selectable<IOrderItem>[],
    orderId: string,
    profileId: string,
  ): Promise<ArchiveResult> {
    const archive = archiver("zip", {
      zlib: { level: 9 }, // Maximum compression
    });

    // Create unique filename
    const filename = `order-${orderId}-${Date.now()}.zip`;
    const tempDir = os.tmpdir();
    const archivePath = path.join(tempDir, filename);
    const output = fs.createWriteStream(archivePath);
    archive.pipe(output);

    // Process each item in the group
    for (const item of group) {
      await this.addItemToArchive(archive, item, profileId);
    }

    // Wait for archive to complete
    await new Promise<void>((resolve, reject) => {
      output.on("close", () => resolve());
      archive.on("error", (err: Error) => reject(err));
      archive.finalize();
    });

    // Upload to S3
    const s3Key = `orders/${orderId}/${filename}`;
    const s3Client = await this.apis.getS3Client(profileId);
    const s3Url = await s3Client.uploadFile(archivePath, s3Key);

    // Get file size
    const stats = fs.statSync(archivePath);

    // Clean up local file
    fs.unlinkSync(archivePath);

    return {
      filename,
      url: s3Url,
      size: stats.size,
    };
  }

  private async addItemToArchive(archive: archiver.Archiver, item: Selectable<IOrderItem>, profileId: string) {
    // Get product variant and its tracks
    const {
      data: [product],
    } = await this.models.Product.getMany({
      productId: item.productId,
      limit: 1,
      profileId,
      page: 1,
      filter: {},
    });
    const productVariant = product?.variants.find((v) => v.id === item.productVariantId);
    if (!productVariant) {
      console.warn(`Product variant not found: ${item.productVariantId}`);
      return;
    }

    const tracks = productVariant.tracks;

    if (tracks.length === 0) {
      console.warn(`No tracks found for product variant: ${item.productVariantId}`);
      return;
    }

    // Check if this is an album (multiple tracks) or single
    if (tracks.length > 1) {
      // Album: create subfolder with tracks
      const albumFolder = `${item.title.replace(/[^a-zA-Z0-9\s-]/g, "")}`;

      for (let index = 0; index < tracks.length; index++) {
        const track = tracks[index];
        const trackNumber = (index + 1).toString().padStart(2, "0");
        const trackTitle = track.title.replace(/[^a-zA-Z0-9\s-]/g, "");
        const media = track.media[0];
        const filename = `${trackNumber} - ${trackTitle}.${media.filename?.split(".").pop() ?? "wav"}`;

        // Add track file to archive
        await this.addFileToArchive(archive, track, `${albumFolder}/${filename}`);
      }
    } else {
      // Single track: add directly to root
      const track = tracks[0];
      const media = track.media[0];
      const trackTitle = track.title || product.title;
      const filename = `${trackTitle.replace(/[^a-zA-Z0-9\s-]/g, "")}.${media.filename?.split(".").pop() ?? "wav"}`;

      await this.addFileToArchive(archive, track, filename);
    }
  }

  private async addFileToArchive(
    archive: archiver.Archiver,
    track: GetManyProductResult[number]["variants"][number]["tracks"][number],
    filename: string,
  ) {
    if (track.media.length === 0) {
      console.warn(`No media found for track: ${track.id}`);
      return;
    }
    const media = track.media[0];

    if (media && media.url) {
      try {
        // Download file and add to archive
        const response = await fetch(media.url);
        if (response.ok) {
          const buffer = await response.arrayBuffer();
          archive.append(Buffer.from(buffer), { name: filename });
        }
      } catch (error) {
        console.error(`Failed to download media file: ${media.url}`, error);
      }
    }
  }

  public async getOrders(accountId: string) {
    const orders = await this.models.Order.getUserOrders({ accountId });
    return orders;
  }

  private getOrderStatus(paymentStatus: PaymentStatus) {
    switch (paymentStatus) {
      case PaymentStatus.Succeeded:
        return OrderStatus.Paid;
      case PaymentStatus.Pending:
        return OrderStatus.InitiatedPayment;
      default:
        return OrderStatus.PaymentFailed;
    }
  }
}
