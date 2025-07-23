import { CreateEmailTemplateInput } from "@src/routes/emails/schema";
import { EmailService } from "..";

export async function createEmailTemplate(this: EmailService, input: CreateEmailTemplateInput) {
  return true;
}
