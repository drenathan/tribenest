import { StreamsService } from "..";
import { StreamChannelProvider } from "@src/db/types/stream";
import { ValidationError } from "@src/utils/app_error";

export async function createTwitchChannel(this: StreamsService, input: { code: string; profileId: string }) {
  const { code, profileId } = input;
  const credentials = await this.apis.twitch.getToken(code);

  if (!credentials) {
    throw new ValidationError("Failed to get Twitch OAuth credentials");
  }

  const channel = await this.apis.twitch.getUser(credentials);

  if (!channel) {
    throw new ValidationError("Failed to get Twitch account");
  }

  const existingChannel = await this.models.StreamChannel.findOne({
    profileId,
    externalId: channel.id,
    channelProvider: StreamChannelProvider.Twitch,
  });

  if (existingChannel) {
    await this.models.StreamChannel.updateOne(
      { id: existingChannel.id },
      {
        credentials: JSON.stringify(this.apis.encryption.encryptObject(credentials, ["access_token", "refresh_token"])),
        brandingSettings: JSON.stringify({
          profileImageUrl: channel.profile_image_url ?? null,
          email: channel.email ?? null,
          createdAt: channel.created_at ?? null,
          channelName: channel.login ?? null,
        }),
        title: channel.display_name,
      },
    );
    return {
      existingChannel: true,
    };
  }

  await this.models.StreamChannel.insertOne({
    externalId: channel.id,
    title: channel.display_name,
    channelProvider: StreamChannelProvider.Twitch,
    profileId,
    credentials: JSON.stringify(this.apis.encryption.encryptObject(credentials, ["access_token", "refresh_token"])),
    brandingSettings: JSON.stringify({
      profileImageUrl: channel.profile_image_url ?? null,
      email: channel.email ?? null,
      createdAt: channel.created_at ?? null,
      channelName: channel.login ?? null,
    }),
  });

  return {
    newChannel: true,
  };
}
