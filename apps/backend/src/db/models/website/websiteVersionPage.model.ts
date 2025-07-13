import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export class WebsiteVersionPageModel extends BaseModel<"websiteVersionPages", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "websiteVersionPages", "id");
  }
}
