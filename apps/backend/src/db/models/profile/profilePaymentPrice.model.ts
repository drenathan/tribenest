import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export type IProfilePaymentPrice = DB["profilePaymentPrices"];

export class ProfilePaymentPriceModel extends BaseModel<"profilePaymentPrices", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "profilePaymentPrices", "id");
  }
}
