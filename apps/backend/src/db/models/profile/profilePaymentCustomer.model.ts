import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export type IProfilePaymentCustomer = DB["profilePaymentCustomers"];

export class ProfilePaymentCustomerModel extends BaseModel<"profilePaymentCustomers", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "profilePaymentCustomers", "id");
  }
}
