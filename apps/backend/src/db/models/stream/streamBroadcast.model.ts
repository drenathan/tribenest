import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export type IStreamBroadcast = DB["streamBroadcasts"];

export class StreamBroadcastModel extends BaseModel<"streamBroadcasts", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "streamBroadcasts", "id");
  }

  public async findWithChannels(broadcastId: string) {
    return this.client
      .selectFrom("streamBroadcasts as sb")
      .where("sb.id", "=", broadcastId)
      .selectAll("sb")
      .select((eb) => [
        this.jsonArrayFrom(
          eb
            .selectFrom("streamBroadcastChannels as sbc")
            .whereRef("sbc.streamBroadcastId", "=", "sb.id")
            .innerJoin("streamChannels as sc", "sbc.streamChannelId", "sc.id")
            .select([
              "sbc.externalBroadcastId",
              "sbc.externalStreamId",
              "sc.channelProvider",
              "sc.credentials",
              "sbc.externalChatId",
              "sbc.id",
              "sbc.nextPageToken",
            ]),
        ).as("channels"),
      ])
      .executeTakeFirst();
  }
}
