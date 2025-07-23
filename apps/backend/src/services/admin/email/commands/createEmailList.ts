import { CreateEmailListInput } from "@src/routes/emails/schema";
import { EmailService } from "..";

export async function createEmailList(this: EmailService, input: CreateEmailListInput) {
  const list = await this.database.client.transaction().execute(async (trx) => {
    if (input.isDefault) {
      await this.models.EmailList.updateMany({ isDefault: true }, { isDefault: false }, trx);
    }
    const list = await this.models.EmailList.insertOne(
      {
        profileId: input.profileId,
        title: input.title,
        isDefault: input.isDefault,
      },
      trx,
    );
    return list;
  });

  return list;
}
