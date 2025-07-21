import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export type ISmartLinkClick = DB["smartLinkClicks"];

export class SmartLinkClickModel extends BaseModel<"smartLinkClicks", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "smartLinkClicks", "id");
  }
}
