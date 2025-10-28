import { Kysely, sql } from "kysely";
import { tables } from "@src/db/constants/tables";
import { addDefaultColumns, addUpdateUpdatedAtTrigger } from "../utils";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .createTable(tables.post_collections)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("profile_id", "uuid", (col) => col.notNull().references(`${tables.profiles}.id`))
    .addColumn("title", "text", (col) => col.notNull())
    .addColumn("description", "text")
    .addColumn("archived_at", "timestamptz")
    .addColumn("post_type", "text", (col) => col.notNull())
    .$call(addDefaultColumns)
    .execute();
  await addUpdateUpdatedAtTrigger(db, tables.post_collections);

  await db.schema
    .createTable(tables.post_collection_posts)
    .addColumn("id", "uuid", (col) => col.primaryKey().defaultTo(sql`gen_random_uuid()`))
    .addColumn("post_id ", "uuid", (col) => col.notNull().references(`${tables.posts}.id`))
    .addColumn("post_collection_id", "uuid", (col) => col.notNull().references(`${tables.post_collections}.id`))
    .addColumn("order", "integer", (col) => col.notNull())
    .$call(addDefaultColumns)
    .execute();

  await addUpdateUpdatedAtTrigger(db, tables.post_collection_posts);
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tables.post_collection_posts).execute();
  await db.schema.dropTable(tables.post_collections).execute();
}
