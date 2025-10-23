import { IStreamChannel } from "@src/db/models/stream/streamChannel.model";
import { StreamsService } from "..";
import { TwitchOAuthCredentials } from "@src/types";
import { Selectable, Transaction } from "kysely";
import { DB } from "@src/db/types";

export async function startTwitchChannelBroadcast(
  this: StreamsService,
  input: { broadcastId: string; channel: Selectable<IStreamChannel> },
  trx?: Transaction<DB>,
) {
  const { broadcastId, channel } = input;
  if (!channel.externalId) {
    return null;
  }
  const credentials = channel.credentials as TwitchOAuthCredentials;
  const decryptedCredentials = this.apis.encryption.decryptObject(credentials, ["access_token", "refresh_token"]);
  const validatedCredentials = await this.apis.twitch.validateAndRefreshToken(decryptedCredentials);

  if (!validatedCredentials.credentials) {
    return null;
  }

  if (validatedCredentials.isRefreshed) {
    const refreshedCredentials = validatedCredentials.credentials as TwitchOAuthCredentials;
    await this.models.StreamChannel.updateOne(
      { id: channel.id },
      {
        credentials: JSON.stringify(
          this.apis.encryption.encryptObject(refreshedCredentials, ["access_token", "refresh_token"]),
        ),
      },
      trx,
    );
  }

  const ingestUrl = await this.apis.twitch.getIngestUrl({
    credentials: validatedCredentials.credentials as TwitchOAuthCredentials,
    broadcasterId: channel.externalId,
  });

  if (!ingestUrl) {
    return null;
  }

  const streamBroadcastChannel = await this.models.StreamBroadcastChannel.insertOne(
    {
      streamBroadcastId: broadcastId,
      streamChannelId: channel.id,
    },
    trx,
  );

  const brandingSettings = channel.brandingSettings as { channelName: string };

  const chatClient = await this.apis.twitch.getChatClient({
    credentials: validatedCredentials.credentials as TwitchOAuthCredentials,
    channelName: brandingSettings.channelName,
  });

  chatClient.connect();

  chatClient.on("message", async (_, tags, message) => {
    await this.models.StreamBroadcastComment.insertOne({
      name: tags.username ?? "",
      content: message,
      streamBroadcastChannelId: streamBroadcastChannel.id,
      isAdmin: false,
      publishedAt: new Date(),
    });
  });

  return ingestUrl;
}
