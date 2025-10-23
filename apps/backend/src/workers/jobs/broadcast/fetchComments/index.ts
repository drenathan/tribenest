import { logger } from "@src/utils/logger";
import BaseJob from "../../../baseJob";
import { add } from "date-fns";

type Args = {
  broadcastId: string;
};

export default class FetchCommentsJob extends BaseJob<Args> {
  name = "FETCH_COMMENTS_JOB";
  tags = ["worker", this.name];
  retryCount = 3;

  async handle({ broadcastId }: Args) {
    const broadcast = await this.database.models.StreamBroadcast.findWithChannels(broadcastId);

    if (broadcast?.endedAt) {
      logger.info({ tags: this.tags }, `Broadcast ${broadcastId} has ended, skipping`);
      return;
    }

    await this.services.admin.streams.fetchComments({ broadcastId });
    const nextFetchAt = add(new Date(), { seconds: 10 });
    await this.schedule(nextFetchAt, { broadcastId });
  }
}
