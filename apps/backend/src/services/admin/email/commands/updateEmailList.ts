import { CreateEmailListInput } from "@src/routes/emails/schema";
import { EmailService } from "..";

export async function updateEmailList(this: EmailService, input: CreateEmailListInput & { emailListId: string }) {
  const list = await this.database.client.transaction().execute(async (trx) => {
    if (input.isDefault) {
      await this.models.EmailList.updateMany({ isDefault: true }, { isDefault: false }, trx);
    }
    const list = await this.models.EmailList.updateOne(
      { id: input.emailListId },
      {
        title: input.title,
        isDefault: input.isDefault,
        profileId: input.profileId,
      },
      trx,
    );

    return list;
  });

  return true;
}
