import { tables } from "@src/db/constants/tables";
import { Kysely, sql } from "kysely";
import { addDefaultColumns } from "../utils";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(tables.stream_templates)
    .addColumn("current_egress_id", "uuid")
    .addColumn("event_id", "uuid", (col) => col.references(`${tables.events}.id`))
    .addColumn("is_live", "boolean")
    .execute();

  await db.schema
    .createTable(tables.stream_template_channels)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("stream_template_id", "uuid", (col) =>
      col.notNull().references(`${tables.stream_templates}.id`).onDelete("cascade"),
    )
    .addColumn("stream_channel_id", "uuid", (col) =>
      col.notNull().references(`${tables.stream_channels}.id`).onDelete("cascade"),
    )
    .$call(addDefaultColumns)
    .execute();

  await db.schema.alterTable(tables.stream_channels).addColumn("current_endpoint", "text").execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(tables.stream_templates)
    .dropColumn("current_egress_id")
    .dropColumn("event_id")
    .dropColumn("is_live")
    .execute();
  await db.schema.alterTable(tables.stream_channels).dropColumn("current_endpoint").execute();
  await db.schema.dropTable(tables.stream_template_channels).execute();
}
