import { ValidationError } from "@src/utils/app_error";
import { EmailService } from "..";
import { renderHtml } from "../utils/EmailRenderer";
import { chunk, uniq } from "lodash";

type SendEmailInput = {
  emailId: string;
  recipientEmails: string[];
};

export async function sendEmail(this: EmailService, input: SendEmailInput) {
  const { emailId, recipientEmails } = input;
  const email = await this.models.Email.findById(emailId);
  if (!email) {
    throw new ValidationError("Email not found");
  }

  const emailClient = await this.apis.getEmailClient(email.profileId);

  const template = await this.models.EmailTemplate.findById(email.emailTemplateId);

  if (!template) {
    throw new ValidationError("Email template not found");
  }

  let json = "";
  try {
    json = JSON.stringify(template.content);
  } catch (error) {
    throw new ValidationError("Invalid email template");
  }

  // TODO: add variables
  const html = await renderHtml(json, email.subject);

  const emailChunks = chunk(uniq(recipientEmails), 100);

  for (const emailChunk of emailChunks) {
    try {
      await emailClient.sendEmail({
        to: emailChunk,
        subject: email.subject,
        html,
      });
      await this.models.EmailRecipient.insertMany(
        emailChunk.map((recipient) => ({
          emailId: email.id,
          recipientEmail: recipient,
          status: "sent",
          sentAt: new Date(),
        })),
      );
    } catch (error) {
      await this.models.EmailRecipient.insertMany(
        emailChunk.map((recipient) => ({
          emailId: email.id,
          recipientEmail: recipient,
          status: "failed",
          failedAt: new Date(),
        })),
      );
    }
  }
  return true;
}
