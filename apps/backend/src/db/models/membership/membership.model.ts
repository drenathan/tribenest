import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";
export type IMembership = DB["memberships"];
export class MembershipModel extends BaseModel<"memberships", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "memberships", "id");
  }

  public async getActiveMembership({ accountId, profileId }: { accountId: string; profileId: string }) {
    const membership = await this.client
      .selectFrom("memberships")
      .where("accountId", "=", accountId)
      .where("profileId", "=", profileId)
      .where("status", "=", "active")
      .selectAll("memberships")
      .select((eb) => [
        this.jsonObjectFrom(
          eb
            .selectFrom("membershipTiers")
            .select((eb) => [
              this.jsonArrayFrom(
                eb
                  .selectFrom("membershipTiersBenefits as mtb")
                  .selectAll()
                  .whereRef("mtb.membershipTierId", "=", "membershipTiers.id")
                  .fullJoin("membershipBenefits as mb", "mb.id", "mtb.membershipBenefitId")
                  .orderBy("mtb.order", "asc"),
              ).as("benefits"),
            ])
            .selectAll()
            .whereRef("membershipTiers.id", "=", "memberships.membershipTierId"),
        ).as("membershipTier"),
      ])
      .executeTakeFirst();

    return membership;
  }
}
