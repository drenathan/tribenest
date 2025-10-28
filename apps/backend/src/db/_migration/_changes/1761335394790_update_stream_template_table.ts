import { tables } from "@src/db/constants/tables";
import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(tables.stream_templates)
    .alterColumn("current_egress_id", (col) => col.setDataType("text"))
    .execute();

  await db.schema
    .alterTable(tables.stream_channels)
    .addColumn("current_broadcast_id", "text")
    .addColumn("current_stream_id", "text")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(tables.stream_channels)
    .dropColumn("current_broadcast_id")
    .dropColumn("current_stream_id")
    .execute();
}
