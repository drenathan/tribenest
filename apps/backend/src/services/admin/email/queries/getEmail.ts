import { GetEmailInput } from "@src/routes/emails/schema";
import { EmailService } from "..";

export async function getEmail(this: EmailService, input: GetEmailInput & { emailId: string }) {
  return true;
}
