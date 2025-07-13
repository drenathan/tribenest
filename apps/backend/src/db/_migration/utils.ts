import { type CreateTableBuilder, Kysely, sql } from "kysely";

export const addDefaultColumns = (ctb: CreateTableBuilder<any, any>) => {
  return ctb
    .addColumn("created_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`))
    .addColumn("updated_at", "timestamptz", (col) => col.notNull().defaultTo(sql`now()`));
};

export const addUpdateUpdatedAtTrigger = async (db: Kysely<any>, table: string) => {
  await sql`
    CREATE TRIGGER update_updated_at_trigger
    BEFORE UPDATE ON ${sql.raw(table)}
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_trigger();
  `.execute(db);
};
