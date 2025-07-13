import { BaseController } from "@src/routes/baseController";
import { createPresignedUrlSchema, CreatePresignedUrlInput } from "./schemas";
import { NextFunction, Request, Response } from "express";
import { Body, RouteHandler, ValidateSchema } from "@src/decorators";

export class UploadsController extends BaseController {
  @ValidateSchema(createPresignedUrlSchema)
  @RouteHandler()
  async createPresignedUrl(
    req: Request,
    res: Response,
    _: NextFunction,
    @Body body?: CreatePresignedUrlInput,
  ): Promise<any> {
    const { fileName } = body!;
    const key = `${req.account!.id}/${Date.now()}-${fileName}`;
    return this.services.apis.s3.getPresignedUrl(key);
  }
}
