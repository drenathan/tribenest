import { StreamsService } from "..";
import { StreamChannelProvider } from "@src/db/types/stream";
import { CreateCustomRtmpChannelInput } from "@src/routes/stream/schema";
import { ValidationError } from "@src/utils/app_error";

export async function createCustomRtmpChannel(this: StreamsService, input: CreateCustomRtmpChannelInput) {
  const { profileId, ingestUrl, title } = input;

  const existingChannel = await this.models.StreamChannel.findOne({
    profileId,
    currentEndpoint: ingestUrl,
  });

  if (existingChannel) {
    throw new ValidationError("A channel with this ingest URL already exists");
  }

  await this.models.StreamChannel.insertOne({
    title,
    channelProvider: StreamChannelProvider.CustomRTMP,
    profileId,
    currentEndpoint: ingestUrl,
    credentials: "{}",
  });

  return true;
}
