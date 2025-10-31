import { StreamsService } from "..";
import { LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL } from "@src/configuration/secrets";
import { IEvent } from "@src/db/models/event/event.model";
import { BadRequestError, ValidationError } from "@src/utils/app_error";
import { Selectable } from "kysely";
import {
  EgressClient,
  ImageFileSuffix,
  ImageOutput,
  RoomServiceClient,
  SegmentedFileOutput,
  StreamOutput,
  StreamProtocol,
  TrackSource,
} from "livekit-server-sdk";

export async function startEgress(
  this: StreamsService,
  input: {
    templateId: string;
    profileId: string;
    eventId?: string;
    title?: string;
    description?: string;
    thumbnailUrl?: string;
  },
) {
  const { templateId, profileId, eventId, title, description, thumbnailUrl } = input;
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
  if (!templateChannels.length && !eventId) {
    throw new BadRequestError("No channels found");
  }

  let broadcastTitle = title || template.title;
  let eventCoverImage: string | null = null;
  if (eventId) {
    const result = await this.models.Event.getMany({ filter: { eventId }, profileId, page: 1, limit: 1 });
    const liveEvent = result.data[0];

    if (!liveEvent) {
      throw new ValidationError("Event not found");
    }

    broadcastTitle = liveEvent.title;
    eventCoverImage = liveEvent.media?.[0]?.url;
  }

  const endpoints: string[] = [];

  const trx = await this.database.client.startTransaction().execute();

  try {
    const broadcast = await this.models.StreamBroadcast.insertOne(
      {
        profileId,
        streamTemplateId: templateId,
        startedAt: new Date(),
        title: broadcastTitle,
        eventId,
      },
      trx,
    );
    for (const channel of templateChannels) {
      const endpoint = await this.startChannelBroadcast(
        { broadcastId: broadcast.id, channel, title: broadcastTitle },
        trx,
      );
      if (endpoint) {
        endpoints.push(endpoint);
      }
    }

    const s3Config = (await this.apis.getS3Client(profileId)).getS3Config();

    const egress = await egressClient.startParticipantEgress(roomId, "egress-user", {
      stream: new StreamOutput({
        protocol: StreamProtocol.RTMP,
        urls: endpoints,
      }),
      segments: new SegmentedFileOutput({
        filenamePrefix: `streams/${broadcast.id}/segment`,
        playlistName: `streams/${broadcast.id}/output.m3u8`,
        livePlaylistName: `streams/${broadcast.id}/output-live.m3u8`,
        segmentDuration: 2,
        output: {
          case: "s3",
          value: {
            accessKey: s3Config.accessKeyId,
            secret: s3Config.secretAccessKey,
            bucket: s3Config.bucketName,
            region: s3Config.region,
            forcePathStyle: true,
            endpoint: s3Config.url,
          },
        },
      }),

      images: new ImageOutput({
        filenamePrefix: `streams/${broadcast.id}/thumbnail`,
        captureInterval: 60,
        filenameSuffix: ImageFileSuffix.IMAGE_SUFFIX_NONE_OVERWRITE,
        output: {
          case: "s3",
          value: {
            accessKey: s3Config.accessKeyId,
            secret: s3Config.secretAccessKey,
            bucket: s3Config.bucketName,
            region: s3Config.region,
            forcePathStyle: true,
            endpoint: s3Config.url,
          },
        },
      }),
    });

    const generatedThumbnailUrl = `${s3Config.bucketUrl}/streams/${broadcast.id}/thumbnail.jpeg`;
    const liveUrl = `${s3Config.bucketUrl}/streams/${broadcast.id}/output-live.m3u8`;
    const vodUrl = `${s3Config.bucketUrl}/streams/${broadcast.id}/output.m3u8`;

    await this.models.StreamBroadcast.updateOne(
      { id: broadcast.id },
      {
        egressId: egress.egressId,
        generatedThumbnailUrl,
        thumbnailUrl: eventCoverImage || thumbnailUrl,
        liveUrl,
        vodUrl,
      },
      trx,
    );
    await trx.commit().execute();
    return broadcast;
  } catch (error) {
    await trx.rollback().execute();
    throw error;
  }
}
