import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export class CommentModel extends BaseModel<"comments", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "comments", "id");
  }
}
