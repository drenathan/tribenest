import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export type IStreamBroadcastChannel = DB["streamBroadcastChannels"];

export class StreamBroadcastChannelModel extends BaseModel<"streamBroadcastChannels", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "streamBroadcastChannels", "id");
  }
}
