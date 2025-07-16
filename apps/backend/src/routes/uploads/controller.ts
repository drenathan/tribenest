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
    const { fileName, profileId } = body!;
    const key = `${profileId}/${Date.now()}-${fileName}`;
    const s3Client = await this.services.apis.getS3Client(profileId);
    return s3Client.getPresignedUrl(key);
  }
}
