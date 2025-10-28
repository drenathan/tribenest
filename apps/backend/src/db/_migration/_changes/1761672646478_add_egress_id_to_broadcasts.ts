import { tables } from "@src/db/constants/tables";
import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(tables.stream_broadcasts).addColumn("egress_id", "text").execute();
  await db.schema.alterTable(tables.stream_templates).dropColumn("current_egress_id").execute();
  await db.schema
    .alterTable(tables.stream_broadcasts)
    .addColumn("event_id", "uuid", (col) => col.references(`${tables.events}.id`))
    .addColumn("start_date", "timestamptz")
    .addColumn("live_url", "text")
    .addColumn("vod_url", "text")
    .addColumn("thumbnail_url", "text")
    .addColumn("generated_thumbnail_url", "text")
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(tables.stream_broadcasts).dropColumn("egress_id").execute();
  await db.schema.alterTable(tables.stream_templates).addColumn("current_egress_id", "text").execute();
  await db.schema
    .alterTable(tables.stream_broadcasts)
    .dropColumn("event_id")
    .dropColumn("start_date")
    .dropColumn("live_url")
    .dropColumn("vod_url")
    .dropColumn("thumbnail_url")
    .dropColumn("generated_thumbnail_url")
    .execute();
}
