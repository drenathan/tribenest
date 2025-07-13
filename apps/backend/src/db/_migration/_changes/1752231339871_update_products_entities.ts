import { tables } from "@src/db/constants/tables";
import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(tables.product_variant_tracks)
    .addColumn("credits", "text")
    .addColumn("artist", "text")
    .addColumn("isrc_code", "text")
    .execute();

  await db.schema
    .alterTable(tables.product_variants)
    .addColumn("upc_code", "text")
    .addColumn("pay_what_you_want", "boolean", (col) => col.defaultTo(false))
    .addColumn("pay_what_you_want_maximum", "integer")
    .execute();

  await db.schema.alterTable(tables.products).addColumn("artist", "text").execute();
  await db.schema
    .alterTable(tables.products)
    .addColumn("credits", "text")
    .addColumn("tags", sql`text[]`)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(tables.product_variant_tracks)
    .dropColumn("credits")
    .dropColumn("artist")
    .dropColumn("isrc_code")
    .execute();
  await db.schema
    .alterTable(tables.product_variants)
    .dropColumn("upc_code")
    .dropColumn("pay_what_you_want")
    .dropColumn("pay_what_you_want_maximum")
    .execute();
  await db.schema.alterTable(tables.products).dropColumn("artist").dropColumn("credits").dropColumn("tags").execute();
}
