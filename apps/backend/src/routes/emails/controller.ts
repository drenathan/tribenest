import { Body, isAuthorized, Query, RouteHandler, ValidateSchema } from "@src/decorators";
import { BaseController } from "../baseController";
import { NextFunction, Request, Response } from "express";
import {
  CreateEmailInput,
  createEmailSchema,
  GetEmailListInput,
  GetEmailsInput,
  getEmailListSchema,
  getEmailsSchema,
  GetEmailTemplateInput,
  getEmailTemplateSchema,
  getEmailListsSchema,
  GetEmailListsInput,
  createEmailListSchema,
  createEmailTemplateSchema,
  CreateEmailListInput,
  CreateEmailTemplateInput,
  GetEmailInput,
  getEmailSchema,
  GetEmailTemplatesInput,
  getEmailTemplatesSchema,
} from "./schema";
import * as policy from "./policy";

export class EmailsController extends BaseController {
  @RouteHandler()
  @ValidateSchema(getEmailsSchema)
  @isAuthorized(policy.read)
  public async getEmails(req: Request, res: Response, next: NextFunction, @Query query?: GetEmailsInput): Promise<any> {
    return this.services.admin.emails.getEmails(query!);
  }

  @RouteHandler()
  @ValidateSchema(getEmailSchema)
  @isAuthorized(policy.read)
  public async getEmail(req: Request, res: Response, next: NextFunction, @Query query?: GetEmailInput): Promise<any> {
    return this.services.admin.emails.getEmail({
      ...query!,
      emailId: req.params.id,
    });
  }

  @RouteHandler()
  @ValidateSchema(createEmailSchema)
  @isAuthorized(policy.read)
  public async createEmail(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: CreateEmailInput,
  ): Promise<any> {
    return this.services.admin.emails.createEmail(body!);
  }

  @RouteHandler()
  @ValidateSchema(getEmailListSchema)
  @isAuthorized(policy.read)
  public async getEmailList(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: GetEmailListInput,
  ): Promise<any> {
    return this.services.admin.emails.getEmailList({
      ...query!,
      emailListId: req.params.id,
    });
  }

  @RouteHandler()
  @ValidateSchema(getEmailListsSchema)
  @isAuthorized(policy.read)
  public async getEmailLists(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: GetEmailListsInput,
  ): Promise<any> {
    return this.services.admin.emails.getEmailLists(query!);
  }

  @RouteHandler()
  @ValidateSchema(createEmailListSchema)
  @isAuthorized(policy.read)
  public async createEmailList(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: CreateEmailListInput,
  ): Promise<any> {
    return this.services.admin.emails.createEmailList(body!);
  }

  @RouteHandler()
  @ValidateSchema(createEmailListSchema)
  @isAuthorized(policy.read)
  public async updateEmailList(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: CreateEmailListInput,
  ): Promise<any> {
    return this.services.admin.emails.updateEmailList({
      ...body!,
      emailListId: req.params.id,
    });
  }

  @RouteHandler()
  @ValidateSchema(getEmailTemplateSchema)
  @isAuthorized(policy.read)
  public async getEmailTemplate(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: GetEmailTemplateInput,
  ): Promise<any> {
    return this.services.admin.emails.getEmailTemplate({
      ...query!,
      emailTemplateId: req.params.id,
    });
  }

  @RouteHandler()
  @ValidateSchema(getEmailTemplatesSchema)
  @isAuthorized(policy.read)
  public async getEmailTemplates(
    req: Request,
    res: Response,
    next: NextFunction,
    @Query query?: GetEmailTemplatesInput,
  ): Promise<any> {
    return this.services.admin.emails.getEmailTemplates(query!);
  }

  @RouteHandler()
  @ValidateSchema(createEmailTemplateSchema)
  @isAuthorized(policy.read)
  public async createEmailTemplate(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: CreateEmailTemplateInput,
  ): Promise<any> {
    return this.services.admin.emails.createEmailTemplate(body!);
  }

  @RouteHandler()
  @ValidateSchema(createEmailTemplateSchema)
  @isAuthorized(policy.read)
  public async updateEmailTemplate(
    req: Request,
    res: Response,
    next: NextFunction,
    @Body body?: CreateEmailTemplateInput,
  ): Promise<any> {
    return this.services.admin.emails.updateEmailTemplate({
      ...body!,
      emailTemplateId: req.params.id,
    });
  }
}
