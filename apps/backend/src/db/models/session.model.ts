import { Kysely } from "kysely";
import BaseModel from "./baseModel";
import { DB } from "../types";

export class SessionModel extends BaseModel<"sessions", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "sessions", "id");
  }
}
