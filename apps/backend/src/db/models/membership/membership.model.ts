import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export class MembershipModel extends BaseModel<"memberships", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "memberships", "id");
  }
}
