import { BaseService } from "@src/services/baseService";
import { NotFoundError } from "@src/utils/app_error";

export class PublicBroadcastsService extends BaseService {
  public async getPublicBroadcasts({ profileId }: { profileId: string }) {
    return await this.models.StreamBroadcast.getPublicBroadcasts({ profileId });
  }

  public async getPublicBroadcast({ profileId, broadcastId }: { profileId: string; broadcastId: string }) {
    const [broadcast] = await this.models.StreamBroadcast.getPublicBroadcasts({ profileId, broadcastId });

    if (!broadcast) {
      throw new NotFoundError("Broadcast not found");
    }
    return broadcast;
  }
}
