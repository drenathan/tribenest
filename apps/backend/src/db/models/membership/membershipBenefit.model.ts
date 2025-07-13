import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export type IMembershipBenefit = DB["membershipBenefits"];

export class MembershipBenefitModel extends BaseModel<"membershipBenefits", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "membershipBenefits", "id");
  }
}
