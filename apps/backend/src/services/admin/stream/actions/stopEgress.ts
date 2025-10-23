import { StreamsService } from "..";
import { ValidationError } from "@src/utils/app_error";
import { EgressClient } from "livekit-server-sdk";
import {
  LIVEKIT_URL,
  LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
} from "@src/configuration/secrets";
import { GoogleOAuthCredentials } from "@src/types";
import { google } from "googleapis";
import { EncryptionService } from "@src/utils/encryption";
import { StreamChannelProvider } from "@src/db/types/stream";

export async function stopEgress(
  this: StreamsService,
  input: { templateId: string; profileId: string; broadcastId: string },
) {
  const { templateId, profileId, broadcastId } = input;
  const template = await this.models.StreamTemplate.findOne({ id: templateId, profileId });
  if (!template || !template.currentEgressId) {
    throw new ValidationError("Template not found");
  }
  const egressClient = new EgressClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
  await egressClient.stopEgress(template.currentEgressId);

  const broadcast = await this.models.StreamBroadcast.findWithChannels(broadcastId);
  if (!broadcast) {
    throw new ValidationError("Broadcast not found");
  }

  const youtubeChannels = broadcast.channels.filter(
    (channel) => channel.channelProvider === StreamChannelProvider.Youtube,
  );

  for (const channel of youtubeChannels) {
    const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);

    const credentials = channel.credentials as GoogleOAuthCredentials;
    oauth2Client.setCredentials({
      ...credentials,
      access_token: EncryptionService.decrypt(credentials.access_token),
      refresh_token: EncryptionService.decrypt(credentials.refresh_token),
    });

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    if (channel.externalBroadcastId) {
      await youtube.liveBroadcasts.transition({
        id: channel.externalBroadcastId,
        broadcastStatus: "complete",
        part: ["status"],
      });
    }
    if (channel.externalStreamId) {
      await youtube.liveStreams.delete({ id: channel.externalStreamId });
    }
  }
  await this.models.StreamBroadcast.updateOne({ id: broadcastId }, { endedAt: new Date() });
  return true;
}
