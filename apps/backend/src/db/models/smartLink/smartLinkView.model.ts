import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export type ISmartLinkView = DB["smartLinkViews"];

export class SmartLinkViewModel extends BaseModel<"smartLinkViews", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "smartLinkViews", "id");
  }
}
