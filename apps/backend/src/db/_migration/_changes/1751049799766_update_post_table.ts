import { tables } from "@src/db/constants/tables";
import { Kysely, sql } from "kysely";
import { addDefaultColumns, addUpdateUpdatedAtTrigger } from "../utils";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(tables.posts)
    .dropColumn("mediaLink")
    .dropColumn("created_by")
    .addColumn("created_by", "uuid", (col) => col.notNull().references(`${tables.accounts}.id`))
    .execute();

  await db.schema
    .alterTable(tables.media)
    .alterColumn("profile_id", (col) => col.setNotNull())
    .execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(tables.posts).addColumn("mediaLink", "text").execute();
}
