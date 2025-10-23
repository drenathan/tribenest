import {
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI,
  LIVEKIT_API_KEY,
  LIVEKIT_API_SECRET,
} from "@src/configuration/secrets";
import { StreamChannelProvider } from "@src/db/types/stream";
import {
  CreateStreamTemplateInput,
  GetStreamChannelsInput,
  GetStreamTemplatesInput,
  GetYoutubeOauthTokenInput,
  UpdateStreamTemplateInput,
  UpdateTemplateChannelsInput,
} from "@src/routes/stream/schema";
import { BaseService, BaseServiceArgs } from "@src/services/baseService";
import { BadRequestError, ValidationError } from "@src/utils/app_error";
import { EncryptionService } from "@src/utils/encryption";
import { google } from "googleapis";
import { AccessToken } from "livekit-server-sdk";
import { startEgress } from "./actions/startEgress";

import { stopEgress } from "./actions/stopEgress";
import { fetchComments } from "./actions/fetchComments";
import { createTwitchOauthUrl } from "./actions/createTwitchOauthUrl";
import { createTwitchChannel } from "./actions/createTwitchChannel";

export class StreamsService extends BaseService {
  public readonly startEgress: typeof startEgress;
  public readonly stopEgress: typeof stopEgress;
  public readonly fetchComments: typeof fetchComments;
  public readonly createTwitchOauthUrl: typeof createTwitchOauthUrl;
  public readonly createTwitchChannel: typeof createTwitchChannel;

  constructor(args: BaseServiceArgs) {
    super(args);
    this.startEgress = startEgress.bind(this);
    this.stopEgress = stopEgress.bind(this);
    this.fetchComments = fetchComments.bind(this);
    this.createTwitchOauthUrl = createTwitchOauthUrl.bind(this);
    this.createTwitchChannel = createTwitchChannel.bind(this);
  }

  public async getStreamTemplates(input: GetStreamTemplatesInput) {
    const templates = await this.models.StreamTemplate.find({ profileId: input.profileId });
    return {
      data: templates,
      total: templates.length,
      page: input.page,
      pageSize: templates.length,
      hasNextPage: false,
      nextPage: null,
    };
  }

  public async getStreamBroadcastComments(input: { broadcastId: string; cursor?: string }) {
    return this.models.StreamBroadcastComment.findMany(input);
  }

  public async getStreamChannels(input: GetStreamChannelsInput) {
    const channels = await this.models.StreamChannel.find({ profileId: input.profileId });
    return {
      data: channels.map((channel) => ({
        ...channel,
        credentials: undefined,
      })),
      total: channels.length,
      page: input.page,
      pageSize: channels.length,
      hasNextPage: false,
      nextPage: null,
    };
  }

  public async getStreamTemplate({ templateId, profileId }: { templateId: string; profileId: string }) {
    const template = await this.models.StreamTemplate.findOne({ id: templateId, profileId });
    return template;
  }

  public async createStreamTemplate(input: CreateStreamTemplateInput) {
    const template = await this.models.StreamTemplate.insertOne({
      profileId: input.profileId,
      title: input.title,
      description: input.description,
      scenes: JSON.stringify(input.scenes),
      config: JSON.stringify(input.config),
    });
    return template;
  }

  public async updateStreamTemplate(input: UpdateStreamTemplateInput) {
    await this.models.StreamTemplate.updateOne(
      { id: input.id },
      {
        title: input.title,
        description: input.description,
        scenes: JSON.stringify(input.scenes),
        config: JSON.stringify(input.config),
      },
    );

    return true;
  }

  public async createYoutubeChannel(input: GetYoutubeOauthTokenInput) {
    const { code, profileId } = input;
    const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);
    const { tokens } = await oauth2Client.getToken(code);
    if (!tokens) {
      throw new ValidationError("Failed to get YouTube OAuth token");
    }

    oauth2Client.setCredentials(tokens);

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const response = await youtube.channels.list({
      part: ["id", "snippet", "statistics", "brandingSettings"],
      mine: true,
    });
    const channel = response.data.items?.[0];

    if (!channel) {
      throw new ValidationError("Failed to get YouTube channel");
    }

    const existingChannel = await this.models.StreamChannel.findOne({
      profileId,
      externalId: channel.id,
      channelProvider: StreamChannelProvider.Youtube,
    });

    if (existingChannel) {
      return {
        existingChannel: true,
      };
    }

    await this.models.StreamChannel.insertOne({
      externalId: channel.id,
      title: channel.snippet?.title,
      channelProvider: StreamChannelProvider.Youtube,
      profileId,
      credentials: JSON.stringify({
        ...tokens,
        access_token: EncryptionService.encrypt(tokens.access_token ?? ""),
        refresh_token: EncryptionService.encrypt(tokens.refresh_token ?? ""),
      }),
      brandingSettings: JSON.stringify({
        banner: channel.brandingSettings?.image?.bannerExternalUrl ?? null,
      }),
    });

    return {
      newChannel: true,
    };
  }

  public async getTemplateChannels(input: { templateId: string; profileId: string }) {
    const template = await this.models.StreamTemplate.findOne({ id: input.templateId, profileId: input.profileId });
    if (!template) {
      throw new ValidationError("Template not found");
    }

    const channels = await this.models.StreamTemplateChannel.find({ streamTemplateId: input.templateId });
    return channels;
  }

  public async updateTemplateChannels(input: UpdateTemplateChannelsInput) {
    const template = await this.models.StreamTemplate.findOne({ id: input.templateId, profileId: input.profileId });
    if (!template) {
      throw new ValidationError("Template not found");
    }

    const existingChannels = await this.models.StreamTemplateChannel.find({ streamTemplateId: template.id });
    const newChannels = input.channelIds.filter(
      (channelId) => !existingChannels.some((c) => c.streamChannelId === channelId),
    );
    const deletedChannels = existingChannels.filter((c) => !input.channelIds.includes(c.streamChannelId));

    try {
      await this.database.client.transaction().execute(async (trx) => {
        if (newChannels.length > 0) {
          await this.models.StreamTemplateChannel.insertMany(
            newChannels.map((channelId) => ({
              streamTemplateId: template.id,
              streamChannelId: channelId,
            })),
            trx,
          );
        }

        if (deletedChannels.length > 0) {
          await this.models.StreamTemplateChannel.deleteMany(
            { streamChannelId: deletedChannels.map((c) => c.streamChannelId), streamTemplateId: template.id },
            undefined,
            trx,
          );
        }
      });
    } catch (error) {
      throw error;
    }
  }

  public async goLive(input: { templateId: string; profileId: string; identity: string }) {
    const { templateId, profileId, identity } = input;
    const template = await this.models.StreamTemplate.findOne({ id: templateId, profileId });
    if (!template) {
      throw new ValidationError("Template not found");
    }

    const templateChannels = await this.models.StreamTemplateChannel.findByTemplateId(templateId);
    if (!templateChannels.length) {
      throw new BadRequestError("No channels found");
    }

    const roomId = templateId + "-egress";

    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity,
    });

    at.addGrant({ room: roomId, roomJoin: true });

    const token = await at.toJwt();
    return { roomId, token };
  }
}
