import { getConfig } from "@src/config";
import nodemailer from "nodemailer";
import { IAttachment } from "./types";
import { emailValidator } from "@src/utils/validators";
import { logger } from "@src/utils/logger";
import { SESv2Client, SendEmailCommand } from "@aws-sdk/client-sesv2";

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
  constructor(private config = getConfig("ses")) {
    const mailCatcherConfig = getConfig("mailCatcher");
    const sesClient = new SESv2Client({
      region: this.config.region,
      credentials: {
        accessKeyId: this.config.accessKeyId,
        secretAccessKey: this.config.secretAccessKey,
      },
    });

    this.transporter = mailCatcherConfig.enabled
      ? nodemailer.createTransport(mailCatcherConfig)
      : nodemailer.createTransport({ SES: { sesClient, SendEmailCommand } });
  }

  public async sendEmail(args: SendEmailArgs) {
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
      logger.info(`Email sent to ${content.to} with result ${result}`);
    } catch (err) {
      logger.error(`Error sending email to ${content.to}`);
      logger.error(err);
    }
  }
}
