import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export class EmailVariableModel extends BaseModel<"emailVariables", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "emailVariables", "id");
  }
}
