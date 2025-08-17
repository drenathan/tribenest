import { Kysely, sql } from "kysely";
import { addDefaultColumns } from "../utils";
import { tables } from "@src/db/constants/tables";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE SEQUENCE IF NOT EXISTS event_passes_id_seq START WITH 1 INCREMENT BY 1 MINVALUE 1 NO MAXVALUE CACHE 1;`.execute(
    db,
  );
  await db.schema
    .createTable(tables.event_passes)
    .addColumn("id", "text", (col) =>
      col.primaryKey().defaultTo(sql` 'TN-' || LPAD(
            (mod(abs(('x' || substr(md5(nextval('event_passes_id_seq')::text), 1, 8))::bit(32)::int), 1000000000))::text,
            9, '0'
        )`),
    )
    .addColumn("event_id", "uuid", (col) => col.notNull().references(`${tables.events}.id`))
    .addColumn("event_ticket_id", "uuid", (col) => col.notNull().references(`${tables.event_tickets}.id`))
    .addColumn("event_ticket_order_item_id", "uuid", (col) =>
      col.notNull().references(`${tables.event_ticket_order_items}.id`),
    )
    .addColumn("owner_name", "text", (col) => col.notNull())
    .addColumn("owner_email", "text", (col) => col.notNull())
    .addColumn("checked_in_at", "timestamptz")
    .$call(addDefaultColumns)
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tables.event_passes).execute();
  await sql`DROP SEQUENCE IF EXISTS event_passes_id_seq;`.execute(db);
}
