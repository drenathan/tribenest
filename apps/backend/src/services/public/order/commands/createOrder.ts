import { CreateOrderInput } from "@src/routes/public/orders/schema";
import { OrderService } from "..";
import { BadRequestError } from "@src/utils/app_error";
import { GetShippingCostResult } from "@src/services/_apis/store/ExternalStore";
import { OrderStatus, ProductDeliveryType } from "@src/db/types/product";
import { groupBy } from "lodash";
import { ChargeResponse, PaymentProvider } from "@src/services/paymentProvider/PaymentProvider";

export async function createOrder(this: OrderService, input: CreateOrderInput) {
  const productVariants = await this.models.ProductVariant.find({
    id: input.cartItems.map((item) => item.productVariantId),
  });

  let firstName = input.firstName;
  let lastName = input.lastName;
  let email = input.email;

  if (input.accountId) {
    const account = await this.models.Account.findById(input.accountId);
    if (!account) {
      throw new BadRequestError("Account not found");
    }
    firstName = account.firstName;
    lastName = account.lastName;
    email = account.email;
  }

  if (!email || !firstName) {
    throw new BadRequestError("Email or first name not found");
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
  let productStoreId: string;

  if (physicalProductVariants.length > 0 && subTotal > 0) {
    if (!input.shippingAddress) {
      throw new BadRequestError("Shipping address is required");
    }

    const profileProductStore = await this.models.ProductStore.findOne({ profileId: input.profileId });
    if (!profileProductStore) {
      throw new BadRequestError("Profile product store not found");
    }
    productStoreId = profileProductStore?.id;
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
        paymentProviderName: paymentProvider?.name || "", // TODO: make this nullable
        paymentId: payment?.paymentId || "", // TODO: make this nullable
        firstName,
        lastName,
        email: input.email,
        accountId: input.accountId,
      },
      trx,
    );

    const physicalOrderItems = input.cartItems.filter((item) =>
      physicalProductVariants.some((pv) => pv.id === item.productVariantId),
    );

    if (physicalOrderItems.length > 0) {
      const physicalProductGroup = await this.models.OrderDeliveryGroup.insertOne(
        {
          orderId: order.id,
          recipientEmail: email,
          recipientName: firstName + " " + lastName,
          isGift: false,
          externalId: shippingCost.externalId,
          shippingCost: shippingCost.shippingCost,
          deliveryType: ProductDeliveryType.Physical,
          productStoreId,
          subTotal: physicalOrderItems.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0),
        },
        trx,
      );

      await this.models.OrderItem.insertMany(
        physicalOrderItems.map((orderItem) => ({
          orderId: order.id,
          orderDeliveryGroupId: physicalProductGroup.id,
          productId: orderItem.productId,
          productVariantId: orderItem.productVariantId,
          quantity: orderItem.quantity,
          price: orderItem.price,
          isGift: orderItem.isGift,
          recipientName: orderItem.recipientName,
          recipientEmail: orderItem.recipientEmail,
          recipientMessage: orderItem.recipientMessage,
          payWhatYouWant: orderItem.payWhatYouWant,
          title: orderItem.title,
          coverImage: orderItem.coverImage,
        })),
        trx,
      );
    }

    const digitalProductVariants = productVariants.filter((pv) => pv.deliveryType === ProductDeliveryType.Digital);
    const digitalOrderItems = input.cartItems.filter((item) =>
      digitalProductVariants.some((pv) => pv.id === item.productVariantId),
    );
    const userDigitalItems = digitalOrderItems.filter((item) => !item.isGift);

    if (userDigitalItems.length > 0) {
      const userDigitalProductGroup = await this.models.OrderDeliveryGroup.insertOne(
        {
          orderId: order.id,
          recipientEmail: email,
          recipientName: firstName + " " + lastName,
          isGift: false,
          deliveryType: ProductDeliveryType.Digital,
          subTotal: userDigitalItems.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0),
        },
        trx,
      );

      await this.models.OrderItem.insertMany(
        userDigitalItems.map((orderItem) => ({
          orderId: order.id,
          orderDeliveryGroupId: userDigitalProductGroup.id,
          productId: orderItem.productId,
          productVariantId: orderItem.productVariantId,
          quantity: orderItem.quantity,
          price: orderItem.price,
          isGift: orderItem.isGift,
          recipientName: orderItem.recipientName,
          recipientEmail: orderItem.recipientEmail,
          recipientMessage: orderItem.recipientMessage,
          payWhatYouWant: orderItem.payWhatYouWant,
          title: orderItem.title,
          coverImage: orderItem.coverImage,
        })),
        trx,
      );
    }

    const giftDigitalItems = groupBy(
      digitalOrderItems.filter((item) => item.isGift),
      "recipientEmail",
    );

    if (Object.keys(giftDigitalItems).length > 0) {
      for (const [recipientEmail, items] of Object.entries(giftDigitalItems)) {
        const giftDigitalProductGroup = await this.models.OrderDeliveryGroup.insertOne(
          {
            orderId: order.id,
            recipientEmail,
            recipientName: items[0].recipientName!,
            isGift: true,
            deliveryType: ProductDeliveryType.Digital,
            subTotal: items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0),
          },
          trx,
        );

        await this.models.OrderItem.insertMany(
          items.map((orderItem) => ({
            orderId: order.id,
            orderDeliveryGroupId: giftDigitalProductGroup.id,
            productId: orderItem.productId,
            productVariantId: orderItem.productVariantId,
            quantity: orderItem.quantity,
            price: orderItem.price,
            isGift: orderItem.isGift,
            recipientName: orderItem.recipientName,
            recipientEmail: orderItem.recipientEmail,
            recipientMessage: orderItem.recipientMessage,
            payWhatYouWant: orderItem.payWhatYouWant,
            title: orderItem.title,
            coverImage: orderItem.coverImage,
          })),
          trx,
        );
      }
    }

    return {
      ...payment,
      orderId: order.id,
      shippingCost: shippingCost.shippingCost,
      subTotal,
      totalAmount,
    };
  });
}
