import { GetEmailsInput } from "@src/routes/emails/schema";
import { EmailService } from "..";

export async function getEmails(this: EmailService, input: GetEmailsInput) {
  return true;
}
