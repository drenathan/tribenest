import { tables } from "@src/db/constants/tables";
import { Kysely, sql } from "kysely";
import { addDefaultColumns, addUpdateUpdatedAtTrigger } from "../utils";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tables.profile_onboarding_steps)
    .addColumn("id", "varchar", (col) => col.notNull())
    .addColumn("profile_id", "uuid", (col) => col.notNull().references("profiles.id"))
    .addColumn("step", "integer", (col) => col.notNull())
    .addColumn("completed_at", "timestamptz")
    .addColumn("title", "varchar", (col) => col.notNull())
    .addColumn("description", "text", (col) => col.notNull())
    .addColumn("action_text", "varchar", (col) => col.notNull())
    .addColumn("action_path", "text", (col) => col.notNull())
    .addColumn("help_link", "text")
    .addPrimaryKeyConstraint("profile_onboarding_steps_pkey", ["id", "profile_id"])
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.profile_onboarding_steps);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tables.profile_onboarding_steps).execute();
}
