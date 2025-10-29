import { ValidateEventPassInput } from "@src/routes/public/events/schema";
import { EventsService } from "..";
import { ValidationError } from "@src/utils/app_error";
import { v4 as uuidv4 } from "uuid";

export async function validateEventPass(this: EventsService, input: ValidateEventPassInput) {
  const { broadcastId, eventPassId, sessionId } = input;

  const broadcast = await this.models.StreamBroadcast.findById(broadcastId);

  if (!broadcast || broadcast.endedAt || !broadcast.startedAt || !broadcast.eventId) {
    throw new ValidationError("Invalid broadcast");
  }

  const eventPass = await this.models.EventPass.findById(eventPassId);

  if (!eventPass || eventPass.eventId !== broadcast.eventId) {
    throw new ValidationError("Invalid event pass");
  }

  if (eventPass.checkedInAt && eventPass.sessionId !== sessionId) {
    throw new ValidationError("Event pass already checked in");
  }

  const newSessionId = sessionId || uuidv4();
  await this.models.EventPass.updateOne({ id: eventPassId }, { checkedInAt: new Date(), sessionId: newSessionId });

  return newSessionId;
}
