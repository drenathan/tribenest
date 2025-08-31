import { Kysely, Selectable } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export type IWebsiteEvent = DB["websiteEvents"];

export class WebsiteEventModel extends BaseModel<"websiteEvents", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "websiteEvents", "id");
  }
}
