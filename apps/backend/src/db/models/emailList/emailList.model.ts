import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export type IEmailList = DB["emailLists"];

export class EmailListModel extends BaseModel<"emailLists", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "emailLists", "id");
  }
}
