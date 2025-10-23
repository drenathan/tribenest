import { StreamsService } from "..";
import { LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL } from "@src/configuration/secrets";
import { BadRequestError, ValidationError } from "@src/utils/app_error";
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
    for (const channel of templateChannels) {
      const endpoint = await this.startChannelBroadcast(
        { broadcastId: broadcast.id, channel, title: template.title },
        trx,
      );
      if (endpoint) {
        endpoints.push(endpoint);
      }
    }

    const egress = await egressClient.startTrackCompositeEgress(
      roomId,
      {
        stream: new StreamOutput({
          protocol: StreamProtocol.RTMP,
          urls: endpoints,
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
