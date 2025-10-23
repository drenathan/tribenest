import { Expression, Kysely, SqlBool } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export type IStreamBroadcastComment = DB["streamBroadcastComments"];

export class StreamBroadcastCommentModel extends BaseModel<"streamBroadcastComments", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "streamBroadcastComments", "id");
  }

  async findMany({ broadcastId, cursor }: { broadcastId: string; cursor?: string }) {
    console.log(cursor);
    return this.client
      .selectFrom("streamBroadcastComments as sbcm")
      .innerJoin("streamBroadcastChannels as sbc", "sbc.id", "sbcm.streamBroadcastChannelId")
      .innerJoin("streamChannels as sc", "sc.id", "sbc.streamChannelId")
      .orderBy("sbcm.publishedAt", "desc")
      .orderBy("sbcm.id", "asc")
      .where((eb) => {
        const conditions: Expression<SqlBool>[] = [];
        conditions.push(eb("sbcm.publishedAt", "is not", null));
        conditions.push(eb("sbc.streamBroadcastId", "=", broadcastId));
        if (cursor) {
          conditions.push(eb("sbcm.id", ">", cursor));
        }
        return eb.and(conditions);
      })
      .select(["sbcm.id", "sbcm.name", "sbcm.content", "sbcm.publishedAt", "sc.channelProvider"])
      .limit(20)
      .execute();
  }
}
