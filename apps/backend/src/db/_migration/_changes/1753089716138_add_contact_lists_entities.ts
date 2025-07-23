import { Kysely, sql } from "kysely";
import { addDefaultColumns, addUpdateUpdatedAtTrigger } from "../utils";
import { tables } from "@src/db/constants/tables";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tables.email_lists)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("profile_id", "uuid", (col) => col.notNull().references(`${tables.profiles}.id`))
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("is_default", "boolean")
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

  await db.schema
    .createTable(tables.emails)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("profile_id", "uuid", (col) => col.notNull().references(`${tables.profiles}.id`))
    .addColumn("email_list_id", "uuid", (col) => col.references(`${tables.email_lists}.id`))
    .addColumn("recipient", "text")
    .addColumn("email_template_id", "uuid", (col) => col.notNull().references(`${tables.email_templates}.id`))
    .addColumn("subject", "text", (col) => col.notNull())
    .addColumn("send_date", "timestamptz")
    .addColumn("status", "text")
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.emails);

  await db.schema
    .createTable(tables.email_recipients)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("email_id", "uuid", (col) => col.notNull().references(`${tables.emails}.id`))
    .addColumn("recipient_email", "text", (col) => col.notNull())
    .addColumn("first_name", "text")
    .addColumn("status", "text")
    .addColumn("sent_at", "timestamptz")
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.email_recipients);

  await db.schema
    .createTable(tables.email_variables)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("profile_id", "uuid", (col) => col.notNull().references(`${tables.profiles}.id`))
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("value", "text", (col) => col.notNull())
    .addUniqueConstraint("email_variables_profile_id_name_unique", ["profile_id", "name"])
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.email_variables);

  const profiles = await db.selectFrom(tables.profiles).select("id").execute();
  for (const profile of profiles) {
    await db
      .insertInto(tables.email_lists)
      .values({
        profile_id: profile.id,
        title: "Default Email List",
        is_default: true,
      })
      .execute();
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tables.email_variables).execute();
  await db.schema.dropTable(tables.email_recipients).execute();
  await db.schema.dropTable(tables.emails).execute();
  await db.schema.dropTable(tables.email_templates).execute();
  await db.schema.dropTable(tables.email_list_subscribers).execute();
  await db.schema.dropTable(tables.email_lists).execute();
}
