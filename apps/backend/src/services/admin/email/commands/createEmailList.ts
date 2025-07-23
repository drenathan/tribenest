import { CreateEmailListInput } from "@src/routes/emails/schema";
import { EmailService } from "..";

export async function createEmailList(this: EmailService, input: CreateEmailListInput) {
  return true;
}
