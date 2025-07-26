import { tables } from "@src/db/constants/tables";
import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(tables.products)
    .addColumn("is_featured", "boolean", (b) => b.notNull().defaultTo(false))
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(tables.products).dropColumn("is_featured").execute();
}
