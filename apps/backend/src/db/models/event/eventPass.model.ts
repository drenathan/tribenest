import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export class EventPassModel extends BaseModel<"eventPasses", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "eventPasses", "id");
  }
}
