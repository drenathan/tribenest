import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";
export type IEmailTemplate = DB["emailTemplates"];

export class EmailTemplateModel extends BaseModel<"emailTemplates", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "emailTemplates", "id");
  }
}
