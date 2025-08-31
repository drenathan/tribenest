import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export type ISmartLinkEvent = DB["smartLinkEvents"];

export class SmartLinkEventModel extends BaseModel<"smartLinkEvents", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "smartLinkEvents", "id");
  }
}
