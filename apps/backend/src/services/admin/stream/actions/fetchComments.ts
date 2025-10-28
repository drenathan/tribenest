import { StreamChannelProvider } from "@src/db/types/stream";
import { StreamsService } from "..";
import { GoogleOAuthCredentials } from "@src/types";
import { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI } from "@src/configuration/secrets";
import { google } from "googleapis";

export async function fetchComments(this: StreamsService, input: { broadcastId: string }) {
  const { broadcastId } = input;
  const broadcast = await this.models.StreamBroadcast.findWithChannels(broadcastId);
  if (!broadcast) {
    return;
  }

  if (broadcast.endedAt) {
    return;
  }

  const youtubeChannels = broadcast.channels.filter(
    (channel) => channel.channelProvider === StreamChannelProvider.Youtube,
  );

  const trx = await this.database.client.startTransaction().execute();

  try {
    for (const channel of youtubeChannels) {
      const { externalChatId } = channel;
      if (!externalChatId) {
        continue;
      }

      const credentials = channel.credentials as GoogleOAuthCredentials;

      const { comments, nextPageToken } = await fetchYoutubeComments({
        liveChatId: externalChatId,
        credentials: {
          ...credentials,
          access_token: this.apis.encryption.decrypt(credentials.access_token),
          refresh_token: this.apis.encryption.decrypt(credentials.refresh_token),
        },
      });

      await this.models.StreamBroadcastChannel.updateOne({ id: channel.id }, { nextPageToken }, trx);

      for (const comment of comments) {
        const existingComment = await this.models.StreamBroadcastComment.findOne(
          {
            externalId: comment.id,
          },
          undefined,
          trx,
        );
        if (existingComment) {
          continue;
        }

        await this.models.StreamBroadcastComment.insertOne(
          {
            externalId: comment.id,
            name: comment.authorName,
            content: comment.content,
            streamBroadcastChannelId: channel.id,
            isAdmin: comment.isAdmin,
            publishedAt: new Date(comment.createdAt),
          },
          trx,
        );
      }
    }
    await trx.commit().execute();
  } catch (error) {
    await trx.rollback().execute();
    throw error;
  }
}

type YoutubeComment = {
  content: string;
  createdAt: string;
  authorName: string;
  isAdmin: boolean;
  id: string;
};

const fetchYoutubeComments = async (input: {
  liveChatId: string;
  credentials: GoogleOAuthCredentials;
  pageToken?: string;
  previousComments?: YoutubeComment[];
}) => {
  const { liveChatId, credentials, pageToken, previousComments = [] } = input;
  const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
  oauth2Client.setCredentials(credentials);

  const youtube = google.youtube({ version: "v3", auth: oauth2Client });

  const response = await youtube.liveChatMessages.list({
    part: ["snippet", "id", "authorDetails"],
    liveChatId,
    pageToken,
    maxResults: 200,
  });

  const comments = (response.data.items || []).map((item) => ({
    content: item.snippet?.displayMessage || "",
    createdAt: item.snippet?.publishedAt || "",
    authorName: item.authorDetails?.displayName || "",
    isAdmin: item.authorDetails?.isChatOwner || false,
    id: item.id || "",
  }));

  const nextPageToken = response.data.nextPageToken;
  const allComments = [...previousComments, ...comments];

  if (nextPageToken && comments.length === 200) {
    return fetchYoutubeComments({ liveChatId, credentials, pageToken: nextPageToken, previousComments: allComments });
  }

  return {
    comments: allComments,
    nextPageToken,
  };
};
