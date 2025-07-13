import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export class MembershipTierModel extends BaseModel<"membershipTiers", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "membershipTiers", "id");
  }

  public async getManyWithBenefits(profileId: string) {
    const membershipTiers = await this.client
      .selectFrom("membershipTiers as mt")
      .where("mt.profileId", "=", profileId)
      .selectAll("mt")
      .select((eb) => [
        this.jsonArrayFrom(
          eb
            .selectFrom("membershipTiersBenefits as mtb")
            .selectAll()
            .whereRef("mtb.membershipTierId", "=", "mt.id")
            .fullJoin("membershipBenefits as mb", "mb.id", "mtb.membershipBenefitId")
            .orderBy("mtb.order", "asc"),
        ).as("benefits"),
      ])
      .orderBy("mt.createdAt", "desc")
      .execute();

    return membershipTiers;
  }
}
