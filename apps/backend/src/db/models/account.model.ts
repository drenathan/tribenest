import { Kysely } from "kysely";
import BaseModel from "./baseModel";
import { DB } from "../types";

export class AccountModel extends BaseModel<"accounts", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "accounts", "id");
  }
}
