import { Body, isAuthorized, Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "../baseController";
import { NextFunction, Request, Response } from "express";
import {
  CreateEventInput,
  createEventSchema,
  GetEventsInput,
  getEventsSchema,
  UpdateEventInput,
  updateEventSchema,
  profileIdQuerySchema,
  createTicketSchema,
  CreateTicketInput,
  updateTicketSchema,
  UpdateTicketInput,
  reorderTicketsSchema,
  ReorderTicketsInput,
  getOrdersSchema,
  GetOrdersInput,
} from "./schema";
import * as policy from "./policy";
import { AccessToken, EgressClient, StreamOutput, StreamProtocol, RoomServiceClient } from "livekit-server-sdk";
import { LIVEKIT_API_KEY, LIVEKIT_API_SECRET, LIVEKIT_URL } from "@src/configuration/secrets";

export class EventsController extends BaseController {
  @RouteHandler()
  @ValidateSchema(getEventsSchema)
  @isAuthorized(policy.getAll)
  public async getEvents(req: Request, res: Response, next: NextFunction, @Query query?: GetEventsInput): Promise<any> {
    return this.services.admin.event.getEvents(query!);
  }

  @RouteHandler()
  @ValidateSchema(createEventSchema)
  @isAuthorized(policy.create)
  public async createEvent(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: CreateEventInput,
  ): Promise<any> {
    return this.services.admin.event.createEvent(body!);
  }

  @RouteHandler()
  @ValidateSchema(updateEventSchema)
  @isAuthorized(policy.update)
  public async updateEvent(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: UpdateEventInput,
  ): Promise<any> {
    return this.services.admin.event.updateEvent(body!);
  }

  @RouteHandler()
  @isAuthorized(policy.update)
  @ValidateSchema(profileIdQuerySchema)
  public async archiveEvent(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { id } = req.params;
    return this.services.admin.event.archiveEvent({ id, profileId: req.query.profileId as string });
  }

  @RouteHandler()
  @isAuthorized(policy.update)
  @ValidateSchema(profileIdQuerySchema)
  public async unarchiveEvent(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { id } = req.params;
    return this.services.admin.event.unarchiveEvent({ id, profileId: req.query.profileId as string });
  }

  @RouteHandler()
  @ValidateSchema(profileIdQuerySchema)
  public async getEvent(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { id } = req.params;
    return this.services.admin.event.getEvent({ eventId: id, profileId: req.query.profileId as string });
  }

  @RouteHandler()
  @ValidateSchema(profileIdQuerySchema)
  @isAuthorized(policy.getAll)
  public async getTickets(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { id } = req.params;
    return this.services.admin.event.getTickets({ eventId: id, profileId: req.query.profileId as string });
  }

  @RouteHandler()
  @ValidateSchema(createTicketSchema)
  @isAuthorized(policy.create)
  public async createTicket(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: CreateTicketInput,
  ): Promise<any> {
    const { id } = req.params;
    return this.services.admin.event.createTicket(
      {
        eventId: id,
        ...body!,
      }!,
    );
  }

  @RouteHandler()
  @ValidateSchema(updateTicketSchema)
  @isAuthorized(policy.update)
  public async updateTicket(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: UpdateTicketInput,
  ): Promise<any> {
    const { id, ticketId } = req.params;
    return this.services.admin.event.updateTicket({
      eventId: id,
      ticketId,
      ...body!,
    });
  }

  @RouteHandler()
  @ValidateSchema(reorderTicketsSchema)
  @isAuthorized(policy.update)
  public async reorderTickets(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: ReorderTicketsInput,
  ): Promise<any> {
    const { id } = req.params;
    return this.services.admin.event.reorderTickets({
      eventId: id,
      ...body!,
      profileId: req.query.profileId as string,
    });
  }

  @RouteHandler()
  @ValidateSchema(profileIdQuerySchema)
  @isAuthorized(policy.getAll)
  public async archiveTicket(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { id, ticketId } = req.params;

    return this.services.admin.event.archiveTicket({
      eventId: id,
      ticketId,
      profileId: req.query.profileId as string,
    });
  }

  @RouteHandler()
  @ValidateSchema(profileIdQuerySchema)
  @isAuthorized(policy.getAll)
  public async unarchiveTicket(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { id, ticketId } = req.params;

    return this.services.admin.event.unarchiveTicket({
      eventId: id,
      ticketId,
      profileId: req.query.profileId as string,
    });
  }

  @RouteHandler()
  @ValidateSchema(getOrdersSchema)
  @isAuthorized(policy.getAll)
  public async getOrders(req: Request, res: Response, next: NextFunction, @Query query?: GetOrdersInput): Promise<any> {
    return this.services.admin.event.getOrders(query!);
  }

  @RouteHandler()
  @ValidateSchema(profileIdQuerySchema)
  @isAuthorized(policy.create)
  public async createRoom(req: Request, res: Response, next: NextFunction): Promise<any> {
    const roomId = "test-room";
    const name = req.account?.firstName + " " + req.account?.lastName;
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: name + Date.now().toString(),
    });
    at.addGrant({ room: roomId, roomJoin: true });

    const token = await at.toJwt();
    return { roomId, token };
  }

  @RouteHandler()
  // @ValidateSchema(profileIdQuerySchema)
  // @isAuthorized(policy.create)
  public async goLive(req: Request, res: Response, next: NextFunction): Promise<any> {
    const roomId = "egress-testing";
    const name = req.account?.firstName + " " + req.account?.lastName;
    const at = new AccessToken(LIVEKIT_API_KEY, LIVEKIT_API_SECRET, {
      identity: name,
    });
    at.addGrant({ room: roomId, roomJoin: true });

    const token = await at.toJwt();

    return { roomId, token };
  }

  @RouteHandler()
  // @ValidateSchema(profileIdQuerySchema)
  // @isAuthorized(policy.create)
  public async startEgress(req: Request, res: Response, next: NextFunction): Promise<any> {
    const roomId = "egress-testing";

    // const roomService = new RoomServiceClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);

    // const [participant] = await roomService.listParticipants(roomId);
    // console.log(JSON.stringify(participant.tracks, null, 2));

    const egressClient = new EgressClient(LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET);
    // console.log("starting egress");

    const egress = await egressClient.startRoomCompositeEgress(roomId, {
      stream: new StreamOutput({
        protocol: StreamProtocol.RTMP,
        urls: [
          "rtmp://x.rtmp.youtube.com/live2/c4tt-8aat-8zxt-ewm0-2dsk",
          "rtmp://live.twitch.tv/app/live_540201758_BwgFeAeY0IrKJZaBrh6Yxa9uZ5WadM",
        ],
      }),
    });
    // const egress = await egressClient.startTrackCompositeEgress(
    //   roomId,
    //   {
    //     stream: new StreamOutput({
    //       protocol: StreamProtocol.RTMP,
    //       urls: [
    //         "rtmp://x.rtmp.youtube.com/live2/c4tt-8aat-8zxt-ewm0-2dsk",
    //         "rtmp://live.twitch.tv/app/live_540201758_BwgFeAeY0IrKJZaBrh6Yxa9uZ5WadM",
    //       ],
    //     }),
    //   },
    //   { videoTrackId: participant.tracks[0].sid },
    // );

    console.log(egress, "egressId");
    // const name = req.account?.firstName + " " + req.account?.lastName;
  }
}
