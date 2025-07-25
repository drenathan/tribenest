import { BaseService } from "../baseService";
import { BadRequestError } from "@src/utils/app_error";
import { CreateEventInput, GetEventsInput, UpdateEventInput } from "@src/routes/events/schema";

export class EventService extends BaseService {
  public async getEvents(input: GetEventsInput) {
    return this.models.Event.getMany(input);
  }

  public async createEvent(input: CreateEventInput) {
    // Validate address fields
    this.validateAddress(input.address);

    return this.models.Event.insertOne(input);
  }

  public async updateEvent(input: UpdateEventInput) {
    const event = await this.models.Event.findOne({
      id: input.id,
      profileId: input.profileId,
    });

    if (!event) {
      throw new BadRequestError("Event not found");
    }

    // Validate address fields
    this.validateAddress(input.address);

    await this.models.Event.updateOne(
      { id: input.id },
      {
        dateTime: input.dateTime,
        address: JSON.stringify(input.address),
        title: input.title,
        description: input.description,
        actionText: input.actionText,
        actionLink: input.actionLink,
      },
    );

    return this.models.Event.findOne({ id: input.id });
  }

  public async archiveEvent({ id, profileId }: { id: string; profileId: string }) {
    const event = await this.models.Event.findOne({ id, profileId });
    if (!event) {
      throw new BadRequestError("Event not found");
    }

    await this.models.Event.updateOne({ id }, { archivedAt: new Date() });

    return this.models.Event.findOne({ id });
  }

  public async unarchiveEvent({ id, profileId }: { id: string; profileId: string }) {
    const event = await this.models.Event.findOne({ id, profileId });
    if (!event) {
      throw new BadRequestError("Event not found");
    }

    await this.models.Event.updateOne({ id }, { archivedAt: null });

    return this.models.Event.findOne({ id });
  }

  private validateAddress(address: { name: string; street: string; city: string; country: string; zipCode?: string }) {
    if (!address.name || !address.street || !address.city || !address.country) {
      throw new BadRequestError("Name, street, city, and country are required");
    }

    // Zip code is only required for US (two-character code)
    if (address.country.toUpperCase() === "US" && !address.zipCode) {
      throw new BadRequestError("Zip code is required for USA addresses");
    }
  }
}
