import { Kysely, sql } from "kysely";
import { addDefaultColumns, addUpdateUpdatedAtTrigger } from "../utils";
import { tables } from "@src/db/constants/tables";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tables.event_tickets)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("event_id", "uuid", (col) => col.notNull().references(`${tables.events}.id`))
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("price", "decimal(10, 2)", (col) => col.notNull())
    .addColumn("quantity", "integer", (col) => col.notNull())
    .addColumn("order", "integer", (col) => col.notNull())
    .$call(addDefaultColumns)
    .execute();

  await db.schema
    .createTable(tables.event_ticket_orders)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("event_id", "uuid", (col) => col.notNull().references(`${tables.events}.id`))
    .addColumn("status", "text", (col) => col.notNull())
    .addColumn("total_amount", "decimal(10, 2)", (col) => col.notNull())
    .addColumn("payment_provider_name", "text")
    .addColumn("payment_id", "text")
    .addColumn("first_name", "text", (col) => col.notNull())
    .addColumn("last_name", "text", (col) => col.notNull())
    .addColumn("email", "text", (col) => col.notNull())
    .$call(addDefaultColumns)
    .execute();

  await db.schema
    .createTable(tables.event_ticket_order_items)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("event_ticket_order_id", "uuid", (col) => col.notNull().references(`${tables.event_ticket_orders}.id`))
    .addColumn("event_ticket_id", "uuid", (col) => col.notNull().references(`${tables.event_tickets}.id`))
    .addColumn("quantity", "integer", (col) => col.notNull())
    .addColumn("price", "decimal(10, 2)", (col) => col.notNull())
    .$call(addDefaultColumns)
    .execute();

  await db.schema
    .alterTable(tables.events)
    .alterColumn("action_text", (col) => col.dropNotNull())
    .alterColumn("action_link", (col) => col.dropNotNull())
    .execute();

  await addUpdateUpdatedAtTrigger(db, tables.event_ticket_order_items);
  await addUpdateUpdatedAtTrigger(db, tables.event_ticket_orders);
  await addUpdateUpdatedAtTrigger(db, tables.event_tickets);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(tables.events)
    .alterColumn("action_text", (col) => col.setNotNull())
    .alterColumn("action_link", (col) => col.setNotNull())
    .execute();

  await db.schema.dropTable(tables.event_ticket_order_items).execute();
  await db.schema.dropTable(tables.event_ticket_orders).execute();
  await db.schema.dropTable(tables.event_tickets).execute();
}
