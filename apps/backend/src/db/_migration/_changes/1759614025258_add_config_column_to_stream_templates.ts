import { tables } from "@src/db/constants/tables";
import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(tables.stream_templates).addColumn("config", "jsonb").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(tables.stream_templates).dropColumn("config").execute();
}
