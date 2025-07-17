import { Body, Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "@src/routes/baseController";
import { NextFunction, Request, Response } from "express";
import { saveSchema, saveStatusSchema, saveCountSchema, SaveInput, SaveStatusInput, SaveCountInput } from "./schema";

export class PublicSaves extends BaseController {
  @RouteHandler()
  @ValidateSchema(saveSchema)
  public async save(req: Request, res: Response, next: NextFunction, @Body body?: SaveInput): Promise<any> {
    const { entityId, entityType } = body!;
    const accountId = req.account!.id;

    await this.services.public.saved.create({ entityId, entityType, accountId });
    return { success: true };
  }

  @RouteHandler()
  @ValidateSchema(saveSchema)
  public async unsave(req: Request, res: Response, next: NextFunction, @Body body?: SaveInput): Promise<any> {
    const { entityId, entityType } = body!;
    const accountId = req.account!.id;

    await this.services.public.saved.delete({ entityId, entityType, accountId });
    return { success: true };
  }

  @RouteHandler()
  @ValidateSchema(saveStatusSchema)
  public async getSaveStatus(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: SaveStatusInput,
  ): Promise<any> {
    const { entityId, entityType } = query!;
    const accountId = req.account!.id;

    const saved = await this.services.public.saved.exists({ entityId, entityType, accountId });
    return { saved };
  }

  @RouteHandler()
  @ValidateSchema(saveCountSchema)
  public async getSaveCount(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: SaveCountInput,
  ): Promise<any> {
    const { entityId, entityType } = query!;

    const count = await this.services.public.saved.count({ entityId, entityType });
    return { count };
  }
}
