import { tables } from "@src/db/constants/tables";
import { Kysely, sql } from "kysely";
import { addDefaultColumns, addUpdateUpdatedAtTrigger } from "../utils";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tables.events)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("profile_id", "uuid", (col) => col.notNull().references(`${tables.profiles}.id`).onDelete("cascade"))
    .addColumn("date_time", "timestamptz", (col) => col.notNull())
    .addColumn("address", "jsonb", (col) => col.notNull())
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("description", "text")
    .addColumn("action_text", "text", (col) => col.notNull())
    .addColumn("action_link", "text", (col) => col.notNull())
    .addColumn("archived_at", "timestamptz")
    .$call(addDefaultColumns)
    .execute();

  await addUpdateUpdatedAtTrigger(db, tables.events);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tables.events).execute();
}
