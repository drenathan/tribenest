import { tables } from "@src/db/constants/tables";
import { Kysely, sql } from "kysely";
import { addDefaultColumns, addUpdateUpdatedAtTrigger } from "../utils";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tables.stream_broadcasts)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("profile_id", "uuid", (col) => col.notNull().references(`${tables.profiles}.id`))
    .addColumn("stream_template_id", "uuid", (col) => col.notNull().references(`${tables.stream_templates}.id`))
    .addColumn("started_at", "timestamptz", (col) => col.notNull())
    .addColumn("ended_at", "timestamptz")
    .addColumn("title", "text", (col) => col.notNull())
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.stream_broadcasts);

  await db.schema
    .createTable(tables.stream_broadcast_channels)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("stream_broadcast_id", "uuid", (col) =>
      col.notNull().references(`${tables.stream_broadcasts}.id`).onDelete("cascade"),
    )
    .addColumn("stream_channel_id", "uuid", (col) =>
      col.notNull().references(`${tables.stream_channels}.id`).onDelete("cascade"),
    )
    .addColumn("external_broadcast_id", "text")
    .addColumn("external_stream_id", "text")
    .addColumn("external_chat_id", "text")
    .addColumn("views", "integer", (col) => col.notNull().defaultTo(0))
    .addColumn("next_page_token", "text")
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.stream_broadcast_channels);

  await db.schema
    .createTable(tables.stream_broadcast_comments)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("stream_broadcast_channel_id", "uuid", (col) =>
      col.notNull().references(`${tables.stream_broadcast_channels}.id`),
    )
    .addColumn("name", "text", (col) => col.notNull())
    .addColumn("content", "text", (col) => col.notNull())
    .addColumn("is_admin", "boolean", (col) => col.notNull().defaultTo(false))
    .addColumn("published_at", "timestamptz")
    .addColumn("external_id", "text")
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.stream_broadcast_comments);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tables.stream_broadcast_comments).execute();
  await db.schema.dropTable(tables.stream_broadcast_channels).execute();
  await db.schema.dropTable(tables.stream_broadcasts).execute();
}
