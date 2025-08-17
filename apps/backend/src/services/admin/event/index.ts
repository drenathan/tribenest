import { BaseService, BaseServiceArgs } from "../../baseService";
import { BadRequestError } from "@src/utils/app_error";
import { CreateEventInput, GetEventsInput, UpdateEventInput } from "@src/routes/events/schema";
import { updateTicket } from "./commands/updateTicket";
import { createTicket } from "./commands/createTicket";
import { reorderTickets } from "./commands/reorderTickets";
import { unarchiveTicket } from "./commands/unarchiveTicket";
import { archiveTicket } from "./commands/archiveTicket";
import { getTickets } from "./queries/getTickets";

export class EventService extends BaseService {
  public readonly updateTicket: typeof updateTicket;
  public readonly createTicket: typeof createTicket;
  public readonly reorderTickets: typeof reorderTickets;
  public readonly unarchiveTicket: typeof unarchiveTicket;
  public readonly archiveTicket: typeof archiveTicket;
  public readonly getTickets: typeof getTickets;

  constructor(args: BaseServiceArgs) {
    super(args);
    this.updateTicket = updateTicket.bind(this);
    this.createTicket = createTicket.bind(this);
    this.reorderTickets = reorderTickets.bind(this);
    this.unarchiveTicket = unarchiveTicket.bind(this);
    this.archiveTicket = archiveTicket.bind(this);
    this.getTickets = getTickets.bind(this);
  }

  public async getEvents(input: GetEventsInput) {
    return this.models.Event.getMany(input);
  }

  public async getEvent(input: { eventId: string; profileId: string }) {
    const result = await this.models.Event.getMany({
      filter: {
        eventId: input.eventId,
        profileId: input.profileId,
        archivedTickets: "true",
      },
      page: 1,
      limit: 1,
      profileId: input.profileId,
    });

    return result.data[0];
  }

  public async createEvent(input: CreateEventInput) {
    // Validate address fields
    this.validateAddress(input.address);

    return this.database.client.transaction().execute(async (trx) => {
      const event = await this.models.Event.insertOne(
        {
          dateTime: input.dateTime,
          address: JSON.stringify(input.address),
          title: input.title,
          description: input.description,
          actionText: input.actionText,
          actionLink: input.actionLink,
          profileId: input.profileId,
        },
        trx,
      );
      if (input.coverImage) {
        const media = await this.models.Media.insertOne(
          {
            url: input.coverImage.file,
            filename: input.coverImage.fileName,
            size: input.coverImage.fileSize,
            profileId: input.profileId,
            parent: "event",
            type: "image",
          },
          trx,
        );
        await this.models.MediaMapping.insertOne(
          {
            mediaId: media.id,
            entityId: event.id,
            entityType: "event",
            order: 1,
          },
          trx,
        );
      }

      return event;
    });
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

    await this.database.client.transaction().execute(async (trx) => {
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
        trx,
      );
      if (input.coverImage) {
        await this.models.Media.deleteManyForEntity(event.id, "event", trx);
        const media = await this.models.Media.insertOne(
          {
            url: input.coverImage.file,
            filename: input.coverImage.fileName,
            size: input.coverImage.fileSize,
            profileId: input.profileId,
            parent: "event",
            type: "image",
          },
          trx,
        );
        await this.models.MediaMapping.insertOne(
          {
            mediaId: media.id,
            entityId: event.id,
            entityType: "event",
            order: 1,
          },
          trx,
        );
      }
    });
    return true;
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
