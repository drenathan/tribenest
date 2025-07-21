import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export type ISmartLink = DB["smartLinks"];

export class SmartLinkModel extends BaseModel<"smartLinks", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "smartLinks", "id");
  }
}
