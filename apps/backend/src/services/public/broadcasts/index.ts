import { BaseService } from "@src/services/baseService";
import { NotFoundError, ValidationError } from "@src/utils/app_error";

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
  async leaveBroadcast(input: { broadcastId: string; sessionId?: string }) {
    const { broadcastId, sessionId } = input;

    if (sessionId) {
      const eventPass = await this.models.EventPass.findOne({ sessionId });
      if (eventPass) {
        await this.models.EventPass.updateOne({ id: eventPass.id }, { checkedInAt: null, sessionId: null });
      }
    }

    return true;
  }

  async validateSession(input: { broadcastId: string; sessionId: string }) {
    const { broadcastId, sessionId } = input;

    const eventPass = await this.models.EventPass.findOne({ sessionId });
    if (!eventPass) {
      throw new NotFoundError("Event pass not found");
    }
    const broadcast = await this.models.StreamBroadcast.findById(broadcastId);
    if (!broadcast) {
      throw new NotFoundError("Broadcast not found");
    }

    if (eventPass.eventId !== broadcast.eventId) {
      throw new ValidationError("Event pass does not belong to broadcast");
    }
    return true;
  }
}
