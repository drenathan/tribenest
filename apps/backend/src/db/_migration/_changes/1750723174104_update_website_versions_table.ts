import { Kysely, sql } from "kysely";
import { tables } from "@src/db/constants/tables";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE SEQUENCE IF NOT EXISTS website_versions_version_seq START WITH 1 INCREMENT BY 1 NO MINVALUE NO MAXVALUE CACHE 1;`.execute(
    db,
  );

  await db.schema
    .alterTable(tables.website_versions)
    .alterColumn("version", (col) => col.setDefault(sql`nextval('website_versions_version_seq')`))
    .addColumn("theme_name", "text", (col) => col.notNull())
    .addColumn("theme_version", "text", (col) => col.notNull())
    .addColumn("theme_settings", "jsonb", (col) => col.notNull())
    .addColumn("theme_thumbnail", "text", (col) => col.notNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(tables.website_versions)
    .alterColumn("version", (col) => col.setDataType(`integer`))
    .dropColumn("theme_name")
    .dropColumn("theme_version")
    .dropColumn("theme_settings")
    .dropColumn("theme_thumbnail")
    .execute();
}
