import { getConfig } from "@src/configuration";
import nodemailer from "nodemailer";
import { IAttachment } from "./types";
import { emailValidator } from "@src/utils/validators";
import { logger } from "@src/utils/logger";

type SendEmailArgs = {
  to: string | string[];
  from?: string;
  subject: string;
  html: string;
  attachments?: IAttachment[];
  bcc?: string | string[];
  cc?: string | string[];
};

export class EmailClient {
  private transporter: nodemailer.Transporter;
  constructor(private config = getConfig("smtp")) {
    const mailCatcherConfig = getConfig("mailCatcher");

    this.transporter = mailCatcherConfig.enabled
      ? nodemailer.createTransport(mailCatcherConfig)
      : nodemailer.createTransport(this.config);
  }

  public async sendEmail(args: SendEmailArgs, throwOnError = false) {
    const content = {
      to: Array.isArray(args.to) ? args.to.filter(Boolean).join(",") : args.to,
      cc: Array.isArray(args.cc) ? args.cc.filter(Boolean).join(",") : args.cc,
      bcc: Array.isArray(args.bcc) ? args.bcc.filter(Boolean).join(",") : args.bcc,
      from: args.from || this.config.from,
      subject: args.subject,
      html: args.html,
      attachments: args.attachments,
    };

    const isValidRecipients = content.to.split(",").every((email) => emailValidator.safeParse(email).success);

    if (!isValidRecipients) {
      logger.error(`Invalid email recipents: ${content.to}`);
      return;
    }

    try {
      const result = await this.transporter.sendMail(content);
      logger.info({
        msg: `Email sent successfully`,
        to: content.to,
        messageId: result.messageId,
        accepted: result.accepted,
        rejected: result.rejected,
      });
    } catch (err) {
      logger.error({
        msg: `Error sending email`,
        to: content.to,
        error: err instanceof Error ? err.message : String(err),
      });
      if (throwOnError) {
        throw err;
      }
    }
  }
}
