import { tables } from "@src/db/constants/tables";
import { ProfileOnboardingStepId } from "@src/db/types/profile";
import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(tables.profile_configurations).addColumn("storage_type", "varchar").execute();
  await db.updateTable(tables.profile_configurations).set({ storage_type: "local" }).execute();
  await db.deleteFrom(tables.profile_onboarding_steps).where("id", "=", ProfileOnboardingStepId.FileStorage).execute();
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.schema.alterTable(tables.profile_configurations).dropColumn("storage_type").execute();
}
