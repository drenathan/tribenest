import { BaseService } from "@src/services/baseService";

export class EventsService extends BaseService {
  public async getEventById({ eventId, profileId }: { eventId: string; profileId: string }) {
    const event = await this.models.Event.getMany({
      profileId,
      filter: {
        eventId,
      },
      page: 1,
      limit: 1,
    });

    return event.data[0];
  }
}
