import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export type IStreamTemplate = DB["streamTemplates"];

export class StreamTemplateModel extends BaseModel<"streamTemplates", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "streamTemplates", "id");
  }
}
