import { CreateEmailInput } from "@src/routes/emails/schema";
import { EmailService } from "..";

export async function createEmail(this: EmailService, input: CreateEmailInput) {
  return true;
}
