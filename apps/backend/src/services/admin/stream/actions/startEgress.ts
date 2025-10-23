import { StreamsService } from "..";
import {
  ADMIN_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET,
  LIVEKIT_URL,
} from "@src/configuration/secrets";
import { StreamChannelProvider } from "@src/db/types/stream";
import { GoogleOAuthCredentials } from "@src/types";
import { BadRequestError, ValidationError } from "@src/utils/app_error";
import { EncryptionService } from "@src/utils/encryption";
import { google } from "googleapis";
import {
  EgressClient,
  EncodingOptionsPreset,
  RoomServiceClient,
  StreamOutput,
  StreamProtocol,
  TrackSource,
} from "livekit-server-sdk";

export async function startEgress(this: StreamsService, input: { templateId: string; profileId: string }) {
  const { templateId, profileId } = input;
  const template = await this.models.StreamTemplate.findOne({ id: templateId, profileId });
  if (!template) {
    throw new ValidationError("Template not found");
  }

  const roomId = templateId + "-egress";

  const roomService = new RoomServiceClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
  const [participant] = await roomService.listParticipants(roomId);

  const egressClient = new EgressClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
  const audioTrack = participant.tracks.find((track) => track.source === TrackSource.MICROPHONE);
  const videoTrack = participant.tracks.find((track) => track.source === TrackSource.CAMERA);

  if (!videoTrack) {
    throw new BadRequestError("No video track found");
  }

  if (!audioTrack) {
    throw new BadRequestError("No audio track found");
  }

  const templateChannels = await this.models.StreamTemplateChannel.findByTemplateId(templateId);
  if (!templateChannels.length) {
    throw new BadRequestError("No channels found");
  }
  const youtubeChannels = templateChannels.filter(
    (channel) => channel.channelProvider === StreamChannelProvider.Youtube,
  );
  const endpoints: string[] = [];

  const trx = await this.database.client.startTransaction().execute();

  try {
    const broadcast = await this.models.StreamBroadcast.insertOne(
      {
        profileId,
        streamTemplateId: templateId,
        startedAt: new Date(),
        title: template.title,
      },
      trx,
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
      const youtubeBroadcast = await youtube.liveBroadcasts.insert({
        part: ["snippet", "contentDetails", "status"],
        requestBody: {
          snippet: { title: template.title, scheduledStartTime: new Date().toISOString() },
          status: {
            privacyStatus: "private", // "public" | "unlisted" | "private"
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
            title: template.title,
          },
          cdn: {
            ingestionType: "rtmp",
            frameRate: "30fps",
            resolution: "1080p",
          },
        },
      });

      if (!youtubeBroadcast.data.id || !stream.data.id || !stream.data.cdn?.ingestionInfo) {
        throw new BadRequestError("Failed to create broadcast or stream");
      }

      await youtube.liveBroadcasts.bind({
        part: ["id", "contentDetails"],
        id: youtubeBroadcast.data.id,
        streamId: stream.data.id,
      });

      const endpoint = `${stream.data.cdn?.ingestionInfo.ingestionAddress}/${stream.data.cdn?.ingestionInfo.streamName}`;

      await this.models.StreamBroadcastChannel.insertOne(
        {
          streamBroadcastId: broadcast.id,
          streamChannelId: channel.id,
          externalBroadcastId: youtubeBroadcast.data.id,
          externalStreamId: stream.data.id,
          externalChatId: youtubeBroadcast.data.snippet?.liveChatId,
        },
        trx,
      );

      endpoints.push(endpoint);
    }

    const egress = await egressClient.startTrackCompositeEgress(
      roomId,
      {
        stream: new StreamOutput({
          protocol: StreamProtocol.RTMP,
          urls: endpoints,
          // urls: [
          //   "rtmp://x.rtmp.youtube.com/live2/qzp0-zr64-uhgt-8744-dr4g",
          //   "rtmp://live.twitch.tv/app/live_540201758_BwgFeAeY0IrKJZaBrh6Yxa9uZ5WadM",
          // ],
        }),
      },
      {
        videoTrackId: videoTrack.sid,
        audioTrackId: audioTrack.sid,
        encodingOptions: EncodingOptionsPreset.H264_1080P_30,
      },
    );

    await this.models.StreamTemplate.updateOne({ id: templateId }, { currentEgressId: egress.egressId });
    await trx.commit().execute();
    return broadcast.id;
  } catch (error) {
    await trx.rollback().execute();
    throw error;
  }
}
