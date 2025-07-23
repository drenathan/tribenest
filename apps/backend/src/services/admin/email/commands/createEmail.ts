import { CreateEmailInput } from "@src/routes/emails/schema";
import { EmailService } from "..";

export async function createEmail(this: EmailService, input: CreateEmailInput) {
  // This throws an error if email is not configured
  await this.apis.getEmailClient(input.profileId);

  const email = await this.database.models.Email.insertOne({
    status: input.sendDate ? "created" : "scheduled",
    subject: input.subject,
    emailTemplateId: input.emailTemplateId,
    emailListId: input.emailListId,
    recipientEmail: input.recipientEmail,
    profileId: input.profileId,
    sendDate: input.sendDate ? new Date(input.sendDate) : null,
    title: input.title,
  });

  return email;
}
