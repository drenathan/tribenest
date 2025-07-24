import { tables } from "@src/db/constants/tables";
import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(tables.profile_configurations)
    .addColumn("pwa_config", "jsonb")
    .addColumn("address", "jsonb")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(tables.profile_configurations).dropColumn("pwa_config").dropColumn("address").execute();
}
