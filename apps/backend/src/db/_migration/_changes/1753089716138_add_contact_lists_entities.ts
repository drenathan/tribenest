import { Kysely, sql } from "kysely";
import { addDefaultColumns, addUpdateUpdatedAtTrigger } from "../utils";
import { tables } from "@src/db/constants/tables";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tables.email_lists)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("profile_id", "uuid", (col) => col.notNull().references(`${tables.profiles}.id`))
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("isDefault", "boolean")
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.email_lists);

  await db.schema
    .createTable(tables.email_list_subscribers)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("email_list_id", "uuid", (col) => col.notNull().references(`${tables.email_lists}.id`))
    .addColumn("email", "text", (col) => col.notNull())
    .addColumn("first_name", "text")
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.email_list_subscribers);

  await db.schema
    .createTable(tables.email_templates)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("profile_id", "uuid", (col) => col.notNull().references(`${tables.profiles}.id`))
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("content", "jsonb", (col) => col.notNull())
    .addColumn("config", "jsonb", (col) => col.notNull())
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.email_templates);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tables.email_templates).execute();
  await db.schema.dropTable(tables.email_list_subscribers).execute();
  await db.schema.dropTable(tables.email_lists).execute();
}
