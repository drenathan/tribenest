import { tables } from "@src/db/constants/tables";
import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema
    .alterTable(tables.membership_tiers)
    .addColumn("archived_at", "timestamptz")
    .addColumn("order", "integer", (c) => c.notNull().defaultTo(0))
    .execute();

  const membershipTiers = await db
    .selectFrom(tables.membership_tiers)
    .select("id")
    .orderBy("created_at", "asc")
    .execute();

  let order = 0;
  for (const membershipTier of membershipTiers) {
    await db.updateTable(tables.membership_tiers).set({ order }).where("id", "=", membershipTier.id).execute();
    order++;
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(tables.membership_tiers).dropColumn("order").dropColumn("archived_at").execute();
}
