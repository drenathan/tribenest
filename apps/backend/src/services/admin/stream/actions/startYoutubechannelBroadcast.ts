import { IStreamChannel } from "@src/db/models/stream/streamChannel.model";
import { StreamsService } from "..";
import { Selectable, Transaction } from "kysely";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } from "@src/configuration/secrets";
import { GoogleOAuthCredentials } from "@src/types";
import { google } from "googleapis";
import { DB } from "@src/db/types";

export async function startYoutubeChannelBroadcast(
  this: StreamsService,
  input: { broadcastId: string; channel: Selectable<IStreamChannel>; title: string },
  trx?: Transaction<DB>,
) {
  const { broadcastId, channel, title } = input;
  const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);

  const credentials = channel.credentials as GoogleOAuthCredentials;
  oauth2Client.setCredentials(this.apis.encryption.decryptObject(credentials, ["access_token", "refresh_token"]));

  const youtube = google.youtube({ version: "v3", auth: oauth2Client });
  const youtubeBroadcast = await youtube.liveBroadcasts.insert({
    part: ["snippet", "contentDetails", "status"],
    requestBody: {
      snippet: { title, scheduledStartTime: new Date().toISOString() },
      status: {
        privacyStatus: "public", // "public" | "unlisted" | "private"
        selfDeclaredMadeForKids: false,
      },
      contentDetails: {
        enableAutoStart: true,
        enableAutoStop: true,
      },
    },
  });

  const stream = await youtube.liveStreams.insert({
    part: ["snippet", "cdn", "contentDetails", "status"],
    requestBody: {
      snippet: {
        title,
      },
      cdn: {
        ingestionType: "rtmp",
        frameRate: "30fps",
        resolution: "1080p",
      },
    },
  });

  if (!youtubeBroadcast.data.id || !stream.data.id || !stream.data.cdn?.ingestionInfo) {
    return null;
  }

  await youtube.liveBroadcasts.bind({
    part: ["id", "contentDetails"],
    id: youtubeBroadcast.data.id,
    streamId: stream.data.id,
  });

  const endpoint = `${stream.data.cdn?.ingestionInfo.ingestionAddress}/${stream.data.cdn?.ingestionInfo.streamName}`;

  await this.models.StreamBroadcastChannel.insertOne(
    {
      streamBroadcastId: broadcastId,
      streamChannelId: channel.id,
      externalBroadcastId: youtubeBroadcast.data.id,
      externalStreamId: stream.data.id,
      externalChatId: youtubeBroadcast.data.snippet?.liveChatId,
    },
    trx,
  );

  return endpoint;
}
