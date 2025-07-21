import { DB } from "@src/db/types";
import { Kysely } from "kysely";
import BaseModel from "../baseModel";

export type IEmailListSubscriber = DB["emailListSubscribers"];

export class EmailListSubscriberModel extends BaseModel<"emailListSubscribers", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "emailListSubscribers", "id");
  }
}
