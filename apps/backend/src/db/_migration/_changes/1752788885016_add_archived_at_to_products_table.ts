import { tables } from "@src/db/constants/tables";
import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  // Migration code
  await db.schema.alterTable(tables.products).addColumn("archived_at", "timestamptz").execute();
  await sql`CREATE INDEX IF NOT EXISTS products_title_trgm_idx ON products USING GIN (title gin_trgm_ops)`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  // Migration code
  await db.schema.alterTable(tables.products).dropColumn("archived_at").execute();
  await sql`DROP INDEX IF EXISTS products_title_trgm_idx`.execute(db);
}
