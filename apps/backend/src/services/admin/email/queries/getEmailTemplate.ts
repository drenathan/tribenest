import { GetEmailTemplateInput } from "@src/routes/emails/schema";
import { EmailService } from "..";

export async function getEmailTemplate(this: EmailService, input: GetEmailTemplateInput & { emailTemplateId: string }) {
  return this.models.EmailTemplate.getOne(input);
}
