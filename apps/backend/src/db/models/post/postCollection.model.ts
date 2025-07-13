import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export class PostCollectionModel extends BaseModel<"postCollections", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "postCollections", "id");
  }
}
