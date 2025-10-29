import { tables } from "@src/db/constants/tables";
import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(tables.event_passes).addColumn("session_id", "uuid").execute();
  // Migration code
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(tables.event_passes).dropColumn("session_id").execute();
}
