import { logger } from "@src/utils/logger";
import BaseJob from "../../../baseJob";
import { OrderStatus } from "@src/db/types/product";

type Args = {
  orderId: string;
  profileId: string;
};

export default class ProcessTicketOrderJob extends BaseJob<Args> {
  name = "PROCESS_TICKET_ORDER_JOB";
  tags = ["worker", this.name];
  retryCount = 3;

  async handle({ orderId, profileId }: Args) {
    logger.info({ tags: this.tags }, `Processing order ${orderId}`);
    if (!profileId || !orderId) {
      logger.error({ tags: this.tags }, `Invalid profileId or orderId`);
      return;
    }

    // make sure we can send emails before attempting to create all the files
    await this.services.apis.getEmailClient(profileId);

    const order = await this.database.models.EventTicketOrder.getOrderById({ orderId, profileId });

    if (!order) {
      logger.error({ tags: this.tags }, `Order ${orderId} not found`);
      return;
    }
    const event = await this.database.models.Event.findOne({ id: order.eventId!, profileId });

    if (!event) {
      logger.error({ tags: this.tags }, `Event ${order.eventId} not found`);
      return;
    }

    await this.workers.emails.ticketOrderDelivery.now({
      ...order,
      profileId,
      event,
      to: order.email!,
      recipientName: `${order.firstName} ${order.lastName}`,
      date: new Date(order.createdAt!).toISOString(),
      orderId: order.id!,
      totalAmount: order.totalAmount!,
      items: order.items.map((item) => ({
        title: item.title!,
        price: item.price!,
        quantity: item.quantity!,
        eventTicketId: item.eventTicketId!,
      })),
    });

    await this.database.models.EventTicketOrder.updateOne({ id: orderId }, { status: OrderStatus.Delivered });

    logger.info({ tags: this.tags }, `Order ${orderId} processed`);
  }
}
