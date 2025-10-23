import { StreamsService } from "..";
import { TWITCH_CLIENT_ID, TWITCH_REDIRECT_URI } from "@src/configuration/secrets";

export async function createTwitchOauthUrl(this: StreamsService) {
  const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${TWITCH_CLIENT_ID}&redirect_uri=${encodeURIComponent(
    TWITCH_REDIRECT_URI,
  )}&response_type=code&scope=user:read:email+channel:manage:broadcast+chat:read+chat:edit+channel:read:stream_key`;

  return authUrl;
}
