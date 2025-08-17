import { Expression, Kysely, Selectable, SqlBool } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";
import { GetEventsInput } from "@src/routes/events/schema";
import { PaginatedData } from "@src/types";

type EventFilters = {
  query?: string;
  upcoming?: string;
  archived?: string;
  eventId?: string;
  archivedTickets?: string;
};

export type IEvent = DB["events"];
export class EventModel extends BaseModel<"events", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "events", "id");
  }

  public async getMany(input: GetEventsInput): Promise<PaginatedData<Selectable<IEvent>>> {
    const offset = (input.page - 1) * input.limit;
    const { query, upcoming, archived, eventId, archivedTickets = "false" } = input.filter as EventFilters;
    const isUpcoming = upcoming === "upcoming";
    const isPast = upcoming === "past";
    const isArchived = archived === "true";
    const includeArchivedTickets = archivedTickets === "true";

    const filterQuery = this.client.selectFrom("events").where((eb) => {
      const conditions: Expression<SqlBool>[] = [];
      conditions.push(eb("profileId", "=", input.profileId));
      if (isArchived) {
        conditions.push(eb("archivedAt", "is not", null));
      } else {
        conditions.push(eb("archivedAt", "is", null));
      }
      if (isUpcoming) {
        conditions.push(eb("dateTime", ">=", new Date())); // TODO: need to get user's timezone
      }
      if (isPast) {
        conditions.push(eb("dateTime", "<", new Date())); // TODO: need to get user's timezone
      }

      if (eventId) {
        conditions.push(eb("id", "=", eventId));
      }

      if (query) {
        conditions.push(
          eb.or([
            eb("title", "ilike", `%${query}%`),
            eb(this.traverseJSONB(eb, "address", "city"), "ilike", `%${query}%`),
          ]),
        );
      }

      return eb.and(conditions);
    });

    const total = await filterQuery.select((eb) => eb.fn.countAll().as("total")).executeTakeFirstOrThrow();
    const data = await filterQuery
      .selectAll()
      .select((eb) => [
        this.jsonArrayFrom(
          eb
            .selectFrom("eventTickets")
            .whereRef("eventId", "=", "events.id")
            .where((eb) => {
              if (!includeArchivedTickets) {
                return eb("archivedAt", "is", null);
              }
              return eb.or([eb("archivedAt", "is", null), eb("archivedAt", "is not", null)]);
            })
            .orderBy("order", "asc")
            .selectAll(),
        ).as("tickets"),

        this.jsonArrayFrom(
          eb
            .selectFrom("mediaMappings")
            .innerJoin("media", "mediaMappings.mediaId", "media.id")
            .whereRef("entityId", "=", "events.id")
            .where("entityType", "=", "event")
            .orderBy("order", "asc")
            .select((eb) => [
              eb.ref("media.url").as("url"),
              eb.ref("media.filename").as("name"),
              eb.ref("media.size").as("size"),
              eb.ref("media.type").as("type"),
              eb.ref("media.id").as("id"),
            ]),
        ).as("media"),
      ])
      .orderBy("dateTime", "asc")
      .limit(input.limit)
      .offset(offset)
      .execute();
    const hasNextPage = data.length === input.limit;
    return {
      data,
      total: Number(total.total),
      page: input.page,
      hasNextPage,
      nextPage: hasNextPage ? input.page + 1 : null,
      pageSize: input.limit,
    };
  }
}
