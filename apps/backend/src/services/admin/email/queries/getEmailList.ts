import { GetEmailListInput } from "@src/routes/emails/schema";
import { EmailService } from "..";

export async function getEmailList(this: EmailService, input: GetEmailListInput & { emailListId: string }) {
  return this.models.EmailList.getOne(input);
}
