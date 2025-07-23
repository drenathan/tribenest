import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export class EmailModel extends BaseModel<"emails", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "emails", "id");
  }
}
