import { Kysely, sql } from "kysely";
import { tables } from "@src/db/constants/tables";
import { addDefaultColumns, addUpdateUpdatedAtTrigger } from "../utils";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tables.media)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("name", "text")
    .addColumn("url", "text", (col) => col.notNull())
    .addColumn("type", "text", (col) => col.notNull())
    .addColumn("size", "bigint", (col) => col.notNull())
    .addColumn("profile_id", "uuid", (col) => col.references(`${tables.profiles}.id`).onDelete("cascade"))
    .addColumn("parent", "text", (col) => col.notNull())
    .$call(addDefaultColumns)
    .execute();

  await addUpdateUpdatedAtTrigger(db, tables.media);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tables.media).execute();
}
