import { CreateEmailTemplateInput } from "@src/routes/emails/schema";
import { EmailService } from "..";

export async function createEmailTemplate(this: EmailService, input: CreateEmailTemplateInput) {
  console.log(input, "createEmailTemplate");
  const template = await this.models.EmailTemplate.insertOne({
    profileId: input.profileId,
    title: input.title,
    content: input.content || "{}",
    config: input.config || "{}",
  });
  return template;
}
