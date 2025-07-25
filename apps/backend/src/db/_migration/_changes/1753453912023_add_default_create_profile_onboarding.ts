import { tables } from "@src/db/constants/tables";
import { getDefaultProfileOnboardingSteps } from "@src/services/profile/contants";
import { Kysely } from "kysely";

export async function up(db: Kysely<any>): Promise<void> {
  const profiles = await db.selectFrom(tables.profiles).select("id").execute();
  for (const profile of profiles) {
    const onboardingSteps = getDefaultProfileOnboardingSteps(profile.id);
    const transformedSteps = onboardingSteps.map((step) => ({
      id: step.id,
      profile_id: step.profileId,
      step: step.step,
      title: step.title,
      description: step.description,
      action_text: step.actionText,
      action_path: step.actionPath,
      help_link: step.helpLink,
    }));
    await db.insertInto(tables.profile_onboarding_steps).values(transformedSteps).execute();
  }
}

export async function down(db: Kysely<any>): Promise<void> {
  await db.deleteFrom(tables.profile_onboarding_steps).execute();
}
