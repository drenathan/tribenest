import { logger } from "@src/utils/logger";
import BaseJob from "../../../baseJob";
import { OrderStatus } from "@src/db/types/product";

type Args = {
  orderId: string;
  profileId: string;
};

export default class ProcessOrderJob extends BaseJob<Args> {
  name = "PROCESS_ORDER_JOB";
  tags = ["worker", this.name];
  retryCount = 3;

  async handle({ orderId, profileId }: Args) {
    logger.info({ tags: this.tags }, `Processing order ${orderId}`);

    // make sure we can send emails before attempting to create all the files
    await this.services.profile.getEmailClient(profileId);

    const result = await this.services.public.order.processOrder({ orderId });

    for (const archive of result.archives) {
      await this.workers.emails.orderDelivery.now({
        ...archive,
        ...result.order,
        profileId,
        to: archive.recipientEmail,
      });
    }

    await this.services.public.order.updateOrderStatus({ orderId, status: OrderStatus.Delivered });
    logger.info({ tags: this.tags }, `Order ${orderId} processed`);
  }
}
