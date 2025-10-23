import { Body, isAuthorized, Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "../baseController";
import { NextFunction, Request, Response } from "express";
import { google } from "googleapis";
import {
  GetStreamTemplatesInput,
  CreateStreamTemplateInput,
  getStreamTemplatesSchema,
  createStreamTemplateSchema,
  updateStreamTemplateSchema,
  UpdateStreamTemplateInput,
  GetYoutubeOauthTokenInput,
  getYoutubeOauthTokenSchema,
  CreateYoutubeOauthUrlInput,
  createYoutubeOauthUrlSchema,
  GetStreamChannelsInput,
  updateTemplateChannelsSchema,
  UpdateTemplateChannelsInput,
  createRoomSchema,
  CreateRoomInput,
  StopEgressInput,
  stopEgressSchema,
  getCommentsSchema,
  GetCommentsInput,
  createCustomRtmpChannelSchema,
  CreateCustomRtmpChannelInput,
} from "./schema";
import * as policy from "./policy";
import {
  ADMIN_URL,
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  LIVEKIT_API_SECRET,
  LIVEKIT_API_KEY,
  LIVEKIT_URL,
} from "@src/configuration/secrets";
import { BadRequestError } from "@src/utils/app_error";
import { ProfileIdInput, profileIdQuerySchema } from "../schema";
import { AccessToken } from "livekit-server-sdk";
import { add } from "date-fns";
import { createCustomRtmpChannel } from "@src/services/admin/stream/actions/createCustomRtmpChannel";

const GOOGLE_REDIRECT_URI = `${ADMIN_URL}/stream/youtube/oauth`;

export class StreamsController extends BaseController {
  @RouteHandler()
  @ValidateSchema(getStreamTemplatesSchema)
  @isAuthorized(policy.getAll)
  public async getStreamTemplates(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: GetStreamTemplatesInput,
  ): Promise<any> {
    return this.services.admin.streams.getStreamTemplates(query!);
  }

  @RouteHandler()
  @ValidateSchema(getStreamTemplatesSchema)
  @isAuthorized(policy.getAll)
  public async getStreamChannels(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: GetStreamChannelsInput,
  ): Promise<any> {
    return this.services.admin.streams.getStreamChannels(query!);
  }

  @RouteHandler()
  @ValidateSchema(getStreamTemplatesSchema)
  @isAuthorized(policy.getAll)
  public async getStreamTemplate(req: Request, res: Response, next: NextFunction): Promise<any> {
    return this.services.admin.streams.getStreamTemplate({
      templateId: req.params.id,
      profileId: req.query.profileId as string,
    });
  }

  @RouteHandler()
  @ValidateSchema(createStreamTemplateSchema)
  @isAuthorized(policy.create)
  public async createStreamTemplate(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: CreateStreamTemplateInput,
  ): Promise<any> {
    return this.services.admin.streams.createStreamTemplate(body!);
  }

  @RouteHandler()
  @ValidateSchema(updateStreamTemplateSchema)
  @isAuthorized(policy.update)
  public async updateStreamTemplate(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: UpdateStreamTemplateInput,
  ): Promise<any> {
    return this.services.admin.streams.updateStreamTemplate(body!);
  }

  @RouteHandler()
  @ValidateSchema(createYoutubeOauthUrlSchema)
  public async createYoutubeOauthUrl(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: CreateYoutubeOauthUrlInput,
  ): Promise<any> {
    const { profileId } = query!;
    const scope = ["https://www.googleapis.com/auth/youtube.force-ssl"];
    const oauth2Client = new google.auth.OAuth2(GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_REDIRECT_URI);

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope,
      prompt: "consent",
    });

    return authUrl;
  }

  @RouteHandler()
  @ValidateSchema(profileIdQuerySchema)
  @isAuthorized(policy.getAll)
  public async createTwitchOauthUrl(req: Request, res: Response, next: NextFunction): Promise<any> {
    return this.services.admin.streams.createTwitchOauthUrl();
  }
  @RouteHandler()
  @ValidateSchema(getYoutubeOauthTokenSchema)
  @isAuthorized(policy.getAll)
  public async getTwitchOauthToken(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: GetYoutubeOauthTokenInput,
  ): Promise<any> {
    return this.services.admin.streams.createTwitchChannel(query!);
  }

  @RouteHandler()
  @ValidateSchema(createCustomRtmpChannelSchema)
  @isAuthorized(policy.getAll)
  public async createCustomRtmpChannel(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: CreateCustomRtmpChannelInput,
  ): Promise<any> {
    return this.services.admin.streams.createCustomRtmpChannel(body!);
  }

  @RouteHandler()
  @ValidateSchema(getYoutubeOauthTokenSchema)
  public async getYoutubeOauthToken(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: GetYoutubeOauthTokenInput,
  ): Promise<any> {
    return this.services.admin.streams.createYoutubeChannel(query!);
  }

  @RouteHandler()
  @ValidateSchema(updateTemplateChannelsSchema)
  @isAuthorized(policy.update)
  public async updateTemplateChannels(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: UpdateTemplateChannelsInput,
  ): Promise<any> {
    return this.services.admin.streams.updateTemplateChannels(body!);
  }

  @RouteHandler()
  @ValidateSchema(profileIdQuerySchema)
  @isAuthorized(policy.getAll)
  public async getTemplateChannels(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: ProfileIdInput,
  ): Promise<any> {
    return this.services.admin.streams.getTemplateChannels({
      profileId: query!.profileId,
      templateId: req.params.id,
    });
  }

  @RouteHandler()
  @ValidateSchema(profileIdQuerySchema)
  @isAuthorized(policy.create)
  public async goLive(req: Request, res: Response, next: NextFunction): Promise<any> {
    return this.services.admin.streams.goLive({
      templateId: req.params.id,
      profileId: req.query.profileId as string,
      identity: req.account?.firstName + " " + req.account?.lastName,
    });
  }

  @RouteHandler()
  @ValidateSchema(profileIdQuerySchema)
  @isAuthorized(policy.create)
  public async startEgress(req: Request, res: Response, next: NextFunction): Promise<any> {
    const broadcastId = await this.services.admin.streams.startEgress({
      templateId: req.params.id,
      profileId: req.query.profileId as string,
    });
    const nextFetchAt = add(new Date(), { seconds: 10 });
    await this.workers.jobs.broadcast.fetchComments.schedule(nextFetchAt, { broadcastId });
    return broadcastId;
  }

  @RouteHandler()
  @ValidateSchema(createRoomSchema)
  @isAuthorized(policy.create)
  public async createRoom(req: Request, res: Response, next: NextFunction, @Body body?: CreateRoomInput): Promise<any> {
    const { id } = req.params;
    const roomId = id + "-live";
    const name = req.account?.firstName + " " + req.account?.lastName;
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: name + Date.now().toString(),
      name: body?.username,
      metadata: body?.userTitle,
    });
    at.addGrant({ room: roomId, roomJoin: true });

    const token = await at.toJwt();
    return { roomId, token };
  }

  @RouteHandler()
  @ValidateSchema(stopEgressSchema)
  @isAuthorized(policy.create)
  public async stopEgress(req: Request, res: Response, next: NextFunction, @Body body?: StopEgressInput): Promise<any> {
    return this.services.admin.streams.stopEgress({
      templateId: req.params.id,
      ...body!,
    });
  }

  @RouteHandler()
  @ValidateSchema(getCommentsSchema)
  @isAuthorized(policy.getAll)
  public async getBroadcastComments(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: GetCommentsInput,
  ): Promise<any> {
    return this.services.admin.streams.getStreamBroadcastComments({
      broadcastId: req.params.id,
      cursor: query!.cursor,
    });
  }
}
