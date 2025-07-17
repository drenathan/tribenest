import { Kysely, sql } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await sql`CREATE EXTENSION IF NOT EXISTS "pg_trgm"`.execute(db);
  await sql`CREATE INDEX IF NOT EXISTS posts_caption_trgm_idx ON posts USING GIN (caption gin_trgm_ops)`.execute(db);
}

export async function down(db: Kysely<any>): Promise<void> {
  await sql`DROP INDEX IF EXISTS posts_caption_trgm_idx`.execute(db);
  await sql`DROP EXTENSION IF EXISTS "pg_trgm"`.execute(db);
}
