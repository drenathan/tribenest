import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export type IMedia = DB["media"];

export class MediaModel extends BaseModel<"media", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "media", "id");
  }
}
