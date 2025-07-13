import { tables } from "@src/db/constants/tables";
import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tables.profile_configurations)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("profile_id", "uuid", (col) => col.references(`${tables.profiles}.id`).notNull().unique())
    .addColumn("payment_provider_name", "text")
    .addColumn("payment_provider_public_key", "text")
    .addColumn("payment_provider_private_key", "text")

    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tables.profile_configurations).execute();
}
