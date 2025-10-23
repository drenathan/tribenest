import { IStreamChannel } from "@src/db/models/stream/streamChannel.model";
import { StreamsService } from "..";
import { StreamChannelProvider } from "@src/db/types/stream";
import { ValidationError } from "@src/utils/app_error";
import { Selectable, Transaction } from "kysely";
import { DB } from "@src/db/types";

export async function startChannelBroadcast(
  this: StreamsService,
  input: { broadcastId: string; channel: Selectable<IStreamChannel>; title: string },
  trx?: Transaction<DB>,
) {
  const { broadcastId, channel, title } = input;

  switch (channel.channelProvider) {
    case StreamChannelProvider.Youtube:
      return this.startYoutubeChannelBroadcast({ broadcastId, channel, title }, trx);
    case StreamChannelProvider.Twitch:
      return this.startTwitchChannelBroadcast({ broadcastId, channel }, trx);
    case StreamChannelProvider.CustomRTMP:
      return this.startCustomRtmpChannelBroadcast({ broadcastId, channel }, trx);
    default:
      return null;
  }
}
