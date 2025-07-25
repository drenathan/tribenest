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
} from "./schema";
import * as policy from "./policy";

export class EventsController extends BaseController {
  @RouteHandler()
  @ValidateSchema(getEventsSchema)
  @isAuthorized(policy.getAll)
  public async getEvents(req: Request, res: Response, next: NextFunction, @Query query?: GetEventsInput): Promise<any> {
    return this.services.event.getEvents(query!);
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
    return this.services.event.createEvent(body!);
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
    return this.services.event.updateEvent(body!);
  }

  @RouteHandler()
  @isAuthorized(policy.update)
  @ValidateSchema(profileIdQuerySchema)
  public async archiveEvent(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { id } = req.params;
    return this.services.event.archiveEvent({ id, profileId: req.query.profileId as string });
  }

  @RouteHandler()
  @isAuthorized(policy.update)
  @ValidateSchema(profileIdQuerySchema)
  public async unarchiveEvent(req: Request, res: Response, next: NextFunction): Promise<any> {
    const { id } = req.params;
    return this.services.event.unarchiveEvent({ id, profileId: req.query.profileId as string });
  }
}
