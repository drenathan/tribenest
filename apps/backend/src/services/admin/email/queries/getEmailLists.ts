import { GetEmailListsInput } from "@src/routes/emails/schema";
import { EmailService } from "..";

export async function getEmailLists(this: EmailService, input: GetEmailListsInput) {
  return this.models.EmailList.getMany(input);
}
