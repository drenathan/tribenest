import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export type IProfilePaymentSubscription = DB["profilePaymentSubscriptions"];

export class ProfilePaymentSubscriptionModel extends BaseModel<"profilePaymentSubscriptions", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "profilePaymentSubscriptions", "id");
  }
}
