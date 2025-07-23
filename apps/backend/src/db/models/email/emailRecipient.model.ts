import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export class EmailRecipientModel extends BaseModel<"emailRecipients", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "emailRecipients", "id");
  }
}
