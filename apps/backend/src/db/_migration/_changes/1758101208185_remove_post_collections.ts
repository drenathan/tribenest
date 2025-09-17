import { tables } from "@src/db/constants/tables";
import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.dropTable(tables.post_collection_posts).execute();
  await db.schema.dropTable(tables.post_collections).execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  // Migration code
  await db.schema.createTable(tables.post_collection_posts).execute();
  await db.schema.createTable(tables.post_collections).execute();
}
