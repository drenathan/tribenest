import { Expression, Kysely, Selectable, SqlBool } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";
import { GetEventsInput } from "@src/routes/events/schema";
import { PaginatedData } from "@src/types";

type EventFilters = {
  query?: string;
  upcoming?: string;
  archived?: string;
};

export type IEvent = DB["events"];
export class EventModel extends BaseModel<"events", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "events", "id");
  }

  public async getMany(input: GetEventsInput): Promise<PaginatedData<Selectable<IEvent>>> {
    const offset = (input.page - 1) * input.limit;
    const { query, upcoming, archived } = input.filter as EventFilters;
    const isUpcoming = upcoming === "upcoming";
    const isPast = upcoming === "past";
    const isArchived = archived === "true";

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
    const data = await filterQuery.selectAll().orderBy("dateTime", "asc").limit(input.limit).offset(offset).execute();

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
