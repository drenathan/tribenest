import { Kysely, sql } from "kysely";
import { tables } from "@src/db/constants/tables";
import { addDefaultColumns, addUpdateUpdatedAtTrigger } from "../utils";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(tables.profiles).addColumn("name", "text").execute();
  await db
    .updateTable(tables.profiles)
    .set((eb) => ({
      name: eb.ref("subdomain"),
    }))
    .execute();

  await db.schema
    .alterTable(tables.profiles)
    .alterColumn("name", (col) => col.setNotNull())
    .execute();

  await db.schema
    .createTable(tables.website_versions)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("version", "integer", (col) => col.notNull())
    .addColumn("is_active", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("profile_id", "uuid", (col) => col.notNull().references(`${tables.profiles}.id`).onDelete("cascade"))
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.website_versions);

  await db.schema
    .createTable(tables.website_version_pages)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("description", "text")
    .addColumn("pathname", "text", (col) => col.notNull())
    .addColumn("website_version_id", "uuid", (col) =>
      col.notNull().references(`${tables.website_versions}.id`).onDelete("cascade"),
    )
    .addColumn("content", "jsonb", (col) => col.notNull().defaultTo("{}"))
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.website_version_pages);

  await db.schema
    .alterTable(tables.website_version_pages)
    .addUniqueConstraint("website_version_pages_pathname_unique", ["pathname", "website_version_id"])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(tables.profiles).dropColumn("name").execute();
  await db.schema.dropTable(tables.website_version_pages).execute();
  await db.schema.dropTable(tables.website_versions).execute();
}
