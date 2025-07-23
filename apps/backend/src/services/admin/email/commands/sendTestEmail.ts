import { ValidationError } from "@src/utils/app_error";
import { EmailService } from "..";
import { renderHtml } from "../utils/EmailRenderer";
import { chunk, uniq } from "lodash";

type SendEmailInput = {
  templateId: string;
  recipientEmail: string;
  subject: string;
};

export async function sendTestEmail(this: EmailService, input: SendEmailInput) {
  const { templateId, recipientEmail, subject } = input;
  const template = await this.models.EmailTemplate.findById(templateId);
  if (!template) {
    throw new ValidationError("Email template not found");
  }

  const emailClient = await this.apis.getEmailClient(template.profileId);

  let json = "";
  try {
    json = JSON.stringify(template.content);
  } catch (error) {
    throw new ValidationError("Invalid email template");
  }

  // TODO: add variables
  const html = await renderHtml(json, subject);

  await emailClient.sendEmail({
    to: recipientEmail,
    subject: subject,
    html,
  });

  return true;
}
