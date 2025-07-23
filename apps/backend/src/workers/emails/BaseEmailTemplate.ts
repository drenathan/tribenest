import { IAttachment, IGlobalVariables } from "./types";
import { Services } from "@src/services";
import { Locale } from "@src/types";
import { Queue } from "bullmq";
import BaseJob from "@src/workers/baseJob";
import { Database } from "@src/db";

export interface BaseTemplateArgs {
  to: string | string[];
  profileId: string;
  attachments?: IAttachment[];
  bcc?: string | string[];
  cc?: string | string[];
  locale?: Locale;
  from?: string;
}

export default abstract class BaseEmailTemplate<T extends BaseTemplateArgs> extends BaseJob<T> {
  public abstract name: string;

  constructor(queue: Queue, services: Services, database: Database) {
    super(queue, services, database);
  }

  public abstract getSubject(variables: T): string;
  // Only for testing/development purposes
  public abstract getPreviewVariables(): T;

  public abstract getHtml(variables: T): Promise<string>;

  public async getPreviewHtml(locale = "en") {
    const html = await this.getHtml({ ...this.getPreviewVariables(), locale });
    return `
     <div style="padding: 20px; background-color: #f5f5f5;">
     <h1 style="text-align: center">${this.getSubject({ ...this.getPreviewVariables(), locale })}</h1>
      <div style="max-width: 900px; margin: 0 auto; background-color: #fff; padding: 20px;">
        ${html}
      </div>
      </div>
    `;
  }

  public async handle(variables: T) {
    const client = await this.services.apis.getEmailClient(variables.profileId);
    await client.sendEmail({
      to: variables.to,
      from: variables.from,
      cc: variables.cc,
      bcc: variables.bcc,
      subject: this.getSubject(variables),
      html: await this.getHtml(variables),
      attachments: variables.attachments,
    });
  }
}
