import { Kysely, sql } from "kysely";
import { addDefaultColumns, addUpdateUpdatedAtTrigger } from "../utils";
import { tables } from "@src/db/constants/tables";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tables.profile_payment_products)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("profile_id", "uuid", (col) => col.notNull().references(`${tables.profiles}.id`))
    .addColumn("payment_provider_name", "text", (col) => col.notNull())
    .addColumn("product_id", "text", (col) => col.notNull())
    .addColumn("product_type", "text", (col) => col.notNull())
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.profile_payment_products);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tables.profile_payment_products).execute();
}
