import { TWITCH_CLIENT_ID, TWITCH_CLIENT_SECRET, TWITCH_REDIRECT_URI } from "@src/configuration/secrets";
import { TwitchOAuthCredentials, TwitchUser } from "@src/types";
import axios from "axios";
import tmi from "tmi.js";

export class TwitchApiService {
  public async validateToken(credentials: TwitchOAuthCredentials) {
    try {
      await axios.get("https://id.twitch.tv/oauth2/validate", {
        headers: {
          Authorization: `Bearer ${credentials.access_token}`,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  }

  public async validateAndRefreshToken(credentials: TwitchOAuthCredentials) {
    const isValid = await this.validateToken(credentials);
    if (isValid) {
      return {
        credentials,
        isRefreshed: false,
      };
    }
    const refreshedCredentials = await this.refreshToken(credentials);

    return {
      credentials: refreshedCredentials,
      isRefreshed: true,
    };
  }

  public async refreshToken(credentials: TwitchOAuthCredentials) {
    try {
      const response = await axios.post("https://id.twitch.tv/oauth2/token", {
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        refresh_token: encodeURIComponent(credentials.refresh_token),
        grant_type: "refresh_token",
      });
      return response.data as TwitchOAuthCredentials;
    } catch (error) {
      return null;
    }
  }

  public async getToken(code: string) {
    try {
      const response = await axios.post("https://id.twitch.tv/oauth2/token", {
        client_id: TWITCH_CLIENT_ID,
        client_secret: TWITCH_CLIENT_SECRET,
        code,
        grant_type: "authorization_code",
        redirect_uri: TWITCH_REDIRECT_URI,
      });
      return response.data as TwitchOAuthCredentials;
    } catch (error) {
      return null;
    }
  }

  public async getUser(credentials: TwitchOAuthCredentials) {
    try {
      const response = await axios.get("https://api.twitch.tv/helix/users", {
        headers: {
          Authorization: `Bearer ${credentials.access_token}`,
          "Client-ID": TWITCH_CLIENT_ID,
        },
      });
      const user = response.data?.data?.[0];
      if (!user) {
        return null;
      }
      return user as TwitchUser;
    } catch (error) {
      return null;
    }
  }

  public async getIngestUrl({
    credentials,
    broadcasterId,
  }: {
    credentials: TwitchOAuthCredentials;
    broadcasterId: string;
  }) {
    try {
      const response = await axios.get(`https://api.twitch.tv/helix/streams/key?broadcaster_id=${broadcasterId}`, {
        headers: {
          Authorization: `Bearer ${credentials.access_token}`,
          "Client-ID": TWITCH_CLIENT_ID,
        },
      });
      const streamKey = response.data?.data?.[0]?.stream_key as string;
      const ingestUrl = `rtmp://live.twitch.tv/app/${streamKey}`;
      return ingestUrl;
    } catch (error) {
      return null;
    }
  }

  public async getStreamInfo({
    credentials,
    broadcasterId,
  }: {
    credentials: TwitchOAuthCredentials;
    broadcasterId: string;
  }) {
    try {
      const response = await axios.get(`https://api.twitch.tv/helix/streams?broadcaster_id=${broadcasterId}`, {
        headers: {
          Authorization: `Bearer ${credentials.access_token}`,
          "Client-ID": TWITCH_CLIENT_ID,
        },
      });
    } catch (error) {
      return false;
    }
  }

  public async getChatClient({
    credentials,
    channelName,
  }: {
    credentials: TwitchOAuthCredentials;
    channelName: string;
  }) {
    const client = new tmi.Client({
      options: { debug: true },
      connection: { reconnect: true },
      identity: {
        username: channelName,
        password: `oauth:${credentials.access_token}`,
      },
      channels: [channelName],
    });
    return client;
  }
}
