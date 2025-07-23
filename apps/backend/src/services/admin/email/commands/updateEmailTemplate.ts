import { CreateEmailTemplateInput } from "@src/routes/emails/schema";
import { EmailService } from "..";

export async function updateEmailTemplate(
  this: EmailService,
  input: CreateEmailTemplateInput & { emailTemplateId: string },
) {
  const template = await this.models.EmailTemplate.updateOne(
    { id: input.emailTemplateId },
    {
      title: input.title,
      content: input.content,
      config: input.config,
    },
  );

  return true;
}
