import { EgressClient } from "livekit-server-sdk";
import { StreamsService } from "..";
import { LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL } from "@src/configuration/secrets";

export async function cleanupBroadcasts(this: StreamsService, { profileId }: { profileId: string }) {
  const activeBroadcasts = await this.models.StreamBroadcast.getActiveBroadcasts({ profileId });

  const egressClient = new EgressClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);

  for (const broadcast of activeBroadcasts) {
    if (!broadcast.egressId) continue;
    try {
      const egress = await egressClient.listEgress({ egressId: broadcast.egressId });
      if (egress.length) {
        try {
          await egressClient.stopEgress(broadcast.egressId);
        } catch (error) {}
      }
    } catch (error) {}

    await this.models.StreamBroadcast.updateOne({ id: broadcast.id }, { endedAt: new Date() });
  }
}
