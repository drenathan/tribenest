import { Kysely, sql } from "kysely";
import { tables } from "../../constants/tables";
import { addDefaultColumns, addUpdateUpdatedAtTrigger } from "../utils";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tables.website_messages)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("profile_id", "uuid", (col) => col.notNull().references(`${tables.profiles}.id`))
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("email", "text", (col) => col.notNull())
    .addColumn("message", "text", (col) => col.notNull())
    .$call(addDefaultColumns)
    .execute();

  await addUpdateUpdatedAtTrigger(db, tables.website_messages);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tables.website_messages).execute();
}
