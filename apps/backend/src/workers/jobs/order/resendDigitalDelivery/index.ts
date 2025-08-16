import { logger } from "@src/utils/logger";
import BaseJob from "../../../baseJob";
import { OrderStatus } from "@src/db/types/product";

type Args = {
  deliveryGroupId: string;
};

export default class ResendDigitalDeliveryJob extends BaseJob<Args> {
  name = "RESEND_DIGITAL_DELIVERY_JOB";
  tags = ["worker", this.name];
  retryCount = 3;

  async handle({ deliveryGroupId }: Args) {
    logger.info({ tags: this.tags }, `Resending digital delivery for delivery group ${deliveryGroupId}`);

    const deliveryGroup = await this.database.models.OrderDeliveryGroup.findById(deliveryGroupId);
    if (!deliveryGroup) {
      logger.error({ tags: this.tags }, `Delivery group ${deliveryGroupId} not found`);
      return;
    }

    if (!deliveryGroup.fileUrl) {
      logger.error({ tags: this.tags }, `File url for delivery group ${deliveryGroupId} not found`);
      return;
    }

    const order = await this.database.models.Order.findById(deliveryGroup.orderId!);

    if (!order) {
      logger.error({ tags: this.tags }, `Order ${deliveryGroup.orderId} not found`);
      return;
    }

    const items = await this.database.models.OrderItem.find({
      orderDeliveryGroupId: deliveryGroupId,
    });

    await this.workers.emails.orderDelivery.now({
      orderId: order.id,
      totalAmount: order.totalAmount,
      date: order.createdAt as unknown as string,
      archive: {
        filename: deliveryGroup.fileName || deliveryGroup.fileUrl?.split("/").pop() || "",
        url: deliveryGroup.fileUrl,
        size: deliveryGroup.fileSize || 0,
      },
      recipientEmail: deliveryGroup.recipientEmail,
      recipientName: deliveryGroup.recipientName,
      recipientMessage: items.map((item) => item.recipientMessage).join("\n"),
      isGift: deliveryGroup.isGift,
      items,
      senderName: deliveryGroup.isGift ? order.firstName! : undefined,
      senderEmail: deliveryGroup.isGift ? order.email! : undefined,
      to: deliveryGroup.recipientEmail,
      profileId: order.profileId,
    });

    logger.info({ tags: this.tags }, `Delivery group ${deliveryGroupId} resent`);
  }
}
