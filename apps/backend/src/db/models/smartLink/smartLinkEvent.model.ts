import { Kysely, sql } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";
import { GetSmartLinkAnalyticsInput } from "@src/routes/smartLinks/schema";
import { endOfDay, startOfDay } from "date-fns";

export type ISmartLinkEvent = DB["smartLinkEvents"];

export class SmartLinkEventModel extends BaseModel<"smartLinkEvents", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "smartLinkEvents", "id");
  }

  public async getMany(input: GetSmartLinkAnalyticsInput & { smartLinkId: string }) {
    const [analytics, countries, cities] = await Promise.all([
      this.client
        .selectFrom("smartLinkEvents")
        .select((eb) => [
          eb.fn.countAll<number>().as("total_events"),
          eb.fn.count<number>(eb.case().when("eventType", "=", "page_view").then(1).end()).as("views"),
          eb.fn.count<number>(eb.case().when("eventType", "=", "click").then(1).end()).as("clicks"),
        ])
        .where("smartLinkId", "=", input.smartLinkId)
        .where("createdAt", ">=", startOfDay(new Date(input.startDate)))
        .where("createdAt", "<=", endOfDay(new Date(input.endDate)))
        .execute(),

      this.client
        .selectFrom("smartLinkEvents")
        .select((eb) => [
          sql<string>`COALESCE(event_data->>'country', 'Unknown')`.as("country"),
          eb.fn.count<number>(eb.case().when("eventType", "=", "page_view").then(1).end()).as("views"),
          eb.fn.count<number>(eb.case().when("eventType", "=", "click").then(1).end()).as("clicks"),
        ])
        .where("smartLinkId", "=", input.smartLinkId)
        .where("createdAt", ">=", startOfDay(new Date(input.startDate)))
        .where("createdAt", "<=", endOfDay(new Date(input.endDate)))
        .groupBy(sql`COALESCE(event_data->>'country', 'Unknown')`)
        .orderBy((eb) => eb.fn.count<number>(eb.case().when("eventType", "=", "click").then(1).end()), "desc")
        .execute(),

      this.client
        .selectFrom("smartLinkEvents")
        .select((eb) => [
          sql<string>`COALESCE(event_data->>'city', 'Unknown')`.as("city"),
          eb.fn.count<number>(eb.case().when("eventType", "=", "page_view").then(1).end()).as("views"),
          eb.fn.count<number>(eb.case().when("eventType", "=", "click").then(1).end()).as("clicks"),
        ])
        .where("smartLinkId", "=", input.smartLinkId)
        .where("createdAt", ">=", startOfDay(new Date(input.startDate)))
        .where("createdAt", "<=", endOfDay(new Date(input.endDate)))
        .groupBy(sql`COALESCE(event_data->>'city', 'Unknown')`)
        .orderBy((eb) => eb.fn.count<number>(eb.case().when("eventType", "=", "click").then(1).end()), "desc")
        .execute(),
    ]);

    return {
      analytics: analytics[0],
      countries,
      cities,
    };
  }
}
