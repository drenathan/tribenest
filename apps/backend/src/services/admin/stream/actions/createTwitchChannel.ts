import { StreamsService } from "..";
import { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_REDIRECT_URI } from "@src/configuration/secrets";
import { StreamChannelProvider } from "@src/db/types/stream";
import { TwitchOAuthCredentials } from "@src/types";
import { ValidationError } from "@src/utils/app_error";
import axios from "axios";

export async function createTwitchChannel(this: StreamsService, input: { code: string; profileId: string }) {
  const { code, profileId } = input;
  const response = await axios.post("https://id.twitch.tv/oauth2/token", {
    client_id: TWITCH_CLIENT_ID,
    client_secret: TWITCH_CLIENT_SECRET,
    code,
    grant_type: "authorization_code",
    redirect_uri: TWITCH_REDIRECT_URI,
  });

  const credentials = response.data as TwitchOAuthCredentials;

  const { data: user } = await axios.get("https://api.twitch.tv/helix/users", {
    headers: {
      Authorization: `Bearer ${credentials.access_token}`,
      "Client-ID": TWITCH_CLIENT_ID,
    },
  });

  const channel = user?.data?.[0];

  if (!channel) {
    throw new ValidationError("Failed to get Twitch account");
  }

  const existingChannel = await this.models.StreamChannel.findOne({
    profileId,
    externalId: channel.id,
    channelProvider: StreamChannelProvider.Twitch,
  });

  if (existingChannel) {
    return {
      existingChannel: true,
    };
  }

  await this.models.StreamChannel.insertOne({
    externalId: channel.id,
    title: channel.display_name,
    channelProvider: StreamChannelProvider.Twitch,
    profileId,
    credentials: JSON.stringify({
      ...credentials,
      access_token: this.apis.encryption.encrypt(credentials.access_token ?? ""),
      refresh_token: this.apis.encryption.encrypt(credentials.refresh_token ?? ""),
    }),
    brandingSettings: JSON.stringify({
      profileImageUrl: channel.profile_image_url ?? null,
      email: channel.email ?? null,
      createdAt: channel.created_at ?? null,
    }),
  });

  return {
    newChannel: true,
  };
}
