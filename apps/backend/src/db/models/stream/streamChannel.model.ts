import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export type IStreamChannel = DB["streamChannels"];

export class StreamChannelModel extends BaseModel<"streamChannels", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "streamChannels", "id");
  }
}
