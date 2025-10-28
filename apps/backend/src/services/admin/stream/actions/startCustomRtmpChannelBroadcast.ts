import { IStreamChannel } from "@src/db/models/stream/streamChannel.model";
import { StreamsService } from "..";
import { Selectable, Transaction } from "kysely";
import { DB } from "@src/db/types";

export async function startCustomRtmpChannelBroadcast(
  this: StreamsService,
  input: { broadcastId: string; channel: Selectable<IStreamChannel> },
  trx?: Transaction<DB>,
) {
  const { broadcastId, channel } = input;
  if (!channel.currentEndpoint) {
    return null;
  }

  await this.models.StreamBroadcastChannel.insertOne(
    {
      streamBroadcastId: broadcastId,
      streamChannelId: channel.id,
    },
    trx,
  );

  return channel.currentEndpoint;
}
