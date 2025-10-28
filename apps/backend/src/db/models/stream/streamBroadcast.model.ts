import { Expression, Kysely, SqlBool } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export type IStreamBroadcast = DB["streamBroadcasts"];

export class StreamBroadcastModel extends BaseModel<"streamBroadcasts", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "streamBroadcasts", "id");
  }

  public async getPublicBroadcasts({ profileId, broadcastId }: { profileId: string; broadcastId?: string }) {
    return this.client
      .selectFrom("streamBroadcasts as sb")
      .where((eb) => {
        const conditions: Expression<SqlBool>[] = [];
        conditions.push(eb("sb.profileId", "=", profileId));
        if (broadcastId) {
          conditions.push(eb("sb.id", "=", broadcastId));
        } else {
          conditions.push(eb("sb.endedAt", "is", null));
        }
        return eb.and(conditions);
      })
      .orderBy("sb.startedAt", "desc")
      .select([
        "sb.id",
        "sb.title",
        "sb.createdAt",
        "sb.updatedAt",
        "sb.profileId",
        "sb.streamTemplateId",
        "sb.startedAt",
        "sb.endedAt",
        "sb.eventId",
        "sb.generatedThumbnailUrl",
        "sb.liveUrl",
        "sb.vodUrl",
        "sb.thumbnailUrl",
      ])
      .execute();
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
