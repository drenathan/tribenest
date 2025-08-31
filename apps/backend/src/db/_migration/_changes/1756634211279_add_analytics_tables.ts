import { tables } from "@src/db/constants/tables";
import { Kysely, sql } from "kysely";
import { addDefaultColumns } from "../utils";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tables.smart_link_clicks).execute();
  await db.schema.dropTable(tables.smart_link_views).execute();

  await db.schema
    .createTable(tables.smart_link_events)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("smart_link_id", "uuid", (col) => col.notNull().references(`${tables.smart_links}.id`))
    .addColumn("event_type", "text", (col) => col.notNull())
    .addColumn("event_data", "jsonb", (col) => col.notNull())
    .$call(addDefaultColumns)
    .execute();

  await db.schema
    .createTable(tables.website_events)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("profile_id", "uuid", (col) => col.notNull().references(`${tables.profiles}.id`))
    .addColumn("event_type", "text", (col) => col.notNull())
    .addColumn("event_data", "jsonb", (col) => col.notNull())
    .$call(addDefaultColumns)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tables.smart_link_events).execute();
  await db.schema.dropTable(tables.website_events).execute();
}
