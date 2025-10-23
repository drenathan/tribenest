import { tables } from "@src/db/constants/tables";
import { Kysely, sql } from "kysely";
import { addDefaultColumns, addUpdateUpdatedAtTrigger } from "../utils";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tables.stream_channels)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("profile_id", "uuid", (col) => col.notNull().references(`${tables.profiles}.id`))
    .addColumn("title", "text")
    .addColumn("channel_provider", "text", (col) => col.notNull())
    .addColumn("external_id", "text")
    .addColumn("credentials", "jsonb", (col) => col.notNull())
    .addColumn("branding_settings", "jsonb")
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.stream_channels);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tables.stream_channels).execute();
}
