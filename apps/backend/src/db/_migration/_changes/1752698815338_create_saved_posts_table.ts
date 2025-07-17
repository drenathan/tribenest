import { tables } from "@src/db/constants/tables";
import { Kysely, sql } from "kysely";
import { addDefaultColumns, addUpdateUpdatedAtTrigger } from "../utils";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tables.saves)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("entity_id", "uuid", (col) => col.notNull())
    .addColumn("entity_type", "text", (col) => col.notNull())
    .addColumn("account_id", "uuid", (col) => col.notNull().references(`${tables.accounts}.id`).onDelete("cascade"))
    .addColumn("archived_at", "timestamptz")
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.saves);

  // Add unique constraint to prevent duplicate saves
  await db.schema
    .alterTable(tables.saves)
    .addUniqueConstraint("saves_unique", ["entity_id", "entity_type", "account_id"])
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tables.saves).execute();
}
