import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export class PostCollectionPostModel extends BaseModel<"postCollectionPosts", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "postCollectionPosts", "id");
  }
}
