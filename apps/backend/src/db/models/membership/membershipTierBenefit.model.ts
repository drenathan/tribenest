import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export type IMembershipTierBenefit = DB["membershipTiersBenefits"];

export class MembershipTierBenefitModel extends BaseModel<"membershipTiersBenefits", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "membershipTiersBenefits", "id");
  }
}
