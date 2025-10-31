import { UpdateBroadcastInput } from "@src/routes/stream/schema";
import { StreamsService } from "..";
import { ValidationError } from "@src/utils/app_error";

export async function updateBroadcast(this: StreamsService, input: UpdateBroadcastInput & { broadcastId: string }) {
  const { broadcastId, ...data } = input;
  const broadcast = await this.models.StreamBroadcast.findWithChannels(broadcastId);
  if (!broadcast) {
    throw new ValidationError("Broadcast not found");
  }

  await this.models.StreamBroadcast.updateOne({ id: broadcastId }, { title: data.title });

  return true;
}
