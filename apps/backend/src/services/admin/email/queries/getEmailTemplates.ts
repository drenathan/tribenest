import { GetEmailTemplatesInput } from "@src/routes/emails/schema";
import { EmailService } from "..";

export async function getEmailTemplates(this: EmailService, input: GetEmailTemplatesInput) {
  return this.models.EmailTemplate.getMany(input);
}
