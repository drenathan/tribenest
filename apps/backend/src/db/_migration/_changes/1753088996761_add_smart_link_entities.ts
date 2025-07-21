import { tables } from "@src/db/constants/tables";
import { Kysely, sql } from "kysely";
import { addDefaultColumns, addUpdateUpdatedAtTrigger } from "../utils";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tables.smart_links)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("profile_id", "uuid", (col) => col.notNull().references(`${tables.profiles}.id`))
    .addColumn("path", "text", (col) => col.notNull().unique())
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("description", "text")
    .addColumn("content", "jsonb", (col) => col.notNull())
    .addColumn("theme_settings", "jsonb", (col) => col.notNull())
    .addColumn("template", "text")
    .addColumn("thumbnail", "text")
    .addColumn("archived_at", "timestamptz")
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.smart_links);

  await db.schema
    .createTable(tables.smart_link_views)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("smart_link_id", "uuid", (col) => col.notNull().references(`${tables.smart_links}.id`))
    .addColumn("user_agent", "jsonb", (col) => col.notNull())
    .addColumn("unique_id", "text", (col) => col.notNull())
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.smart_link_views);

  await db.schema
    .createTable(tables.smart_link_clicks)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("smart_link_id", "uuid", (col) => col.notNull().references(`${tables.smart_links}.id`))
    .addColumn("user_agent", "jsonb", (col) => col.notNull())
    .addColumn("unique_id", "text", (col) => col.notNull())
    .addColumn("button_id", "text", (col) => col.notNull())
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.smart_link_clicks);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tables.smart_link_views).execute();
  await db.schema.dropTable(tables.smart_link_clicks).execute();
  await db.schema.dropTable(tables.smart_links).execute();
}
