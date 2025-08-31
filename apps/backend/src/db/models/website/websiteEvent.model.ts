import { Kysely, Selectable, sql } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";
import { GetWebsiteAnalyticsInput } from "@src/routes/websites/schema";
import { endOfDay, startOfDay } from "date-fns";

export type IWebsiteEvent = DB["websiteEvents"];

export class WebsiteEventModel extends BaseModel<"websiteEvents", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "websiteEvents", "id");
  }

  public async getMany(input: GetWebsiteAnalyticsInput) {
    const [analytics, countries, cities, pages] = await Promise.all([
      // 1. Overall analytics including visits (unique sessions)
      this.client
        .selectFrom("websiteEvents")
        .select((eb) => [
          eb.fn.countAll().as("totalEvents"),
          eb.fn.count(eb.case().when("eventType", "=", "page_view").then(1).end()).as("pageViews"),
          eb.fn.count(eb.case().when("eventType", "=", "click").then(1).end()).as("clicks"),
          // Count unique sessions for visits using raw SQL
          sql<number>`COUNT(DISTINCT event_data->>'sessionId')`.as("visits"),
        ])
        .where("profileId", "=", input.profileId)
        .where("createdAt", ">=", startOfDay(new Date(input.startDate)))
        .where("createdAt", "<=", endOfDay(new Date(input.endDate)))
        .execute(),

      // 2. Country-based visits
      this.client
        .selectFrom("websiteEvents")
        .select((eb) => [
          sql<string>`COALESCE(event_data->>'country', 'Unknown')`.as("country"),
          eb.fn.count(eb.case().when("eventType", "=", "page_view").then(1).end()).as("pageViews"),
          eb.fn.count(eb.case().when("eventType", "=", "click").then(1).end()).as("clicks"),
          // Count unique sessions per country for visits
          sql<number>`COUNT(DISTINCT event_data->>'sessionId')`.as("visits"),
        ])
        .where("profileId", "=", input.profileId)
        .where("createdAt", ">=", startOfDay(new Date(input.startDate)))
        .where("createdAt", "<=", endOfDay(new Date(input.endDate)))
        .groupBy(sql`COALESCE(event_data->>'country', 'Unknown')`)
        .orderBy(sql`COUNT(DISTINCT event_data->>'sessionId')`, "desc")
        .execute(),

      // 3. City-based visits
      this.client
        .selectFrom("websiteEvents")
        .select((eb) => [
          sql<string>`COALESCE(event_data->>'city', 'Unknown')`.as("city"),
          eb.fn.count(eb.case().when("eventType", "=", "page_view").then(1).end()).as("pageViews"),
          eb.fn.count(eb.case().when("eventType", "=", "click").then(1).end()).as("clicks"),
          // Count unique sessions per city for visits
          sql<number>`COUNT(DISTINCT event_data->>'sessionId')`.as("visits"),
        ])
        .where("profileId", "=", input.profileId)
        .where("createdAt", ">=", startOfDay(new Date(input.startDate)))
        .where("createdAt", "<=", endOfDay(new Date(input.endDate)))
        .groupBy(sql`COALESCE(event_data->>'city', 'Unknown')`)
        .orderBy(sql`COUNT(DISTINCT event_data->>'sessionId')`, "desc")
        .execute(),

      // 4. Top pages by page views
      this.client
        .selectFrom("websiteEvents")
        .select((eb) => [
          sql<string>`COALESCE(event_data->>'pathname', 'Unknown')`.as("pathname"),
          eb.fn.count(eb.case().when("eventType", "=", "page_view").then(1).end()).as("pageViews"),
        ])
        .where("profileId", "=", input.profileId)
        .where("eventType", "=", "page_view")
        .where("createdAt", ">=", startOfDay(new Date(input.startDate)))
        .where("createdAt", "<=", endOfDay(new Date(input.endDate)))
        .groupBy(sql`COALESCE(event_data->>'pathname', 'Unknown')`)
        .orderBy((eb) => eb.fn.count(eb.case().when("eventType", "=", "page_view").then(1).end()), "desc")
        .limit(20) // Top 20 pages
        .execute(),
    ]);

    return {
      analytics: analytics[0],
      countries,
      cities,
      pages,
    };
  }
}
