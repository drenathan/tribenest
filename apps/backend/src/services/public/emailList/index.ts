import { JoinEmailListInput, UnsubscribeFromEmailListInput } from "@src/routes/public/emailLists/schema";
import { BaseService } from "@src/services/baseService";
import { NotFoundError } from "@src/utils/app_error";

export class EmailListService extends BaseService {
  public async joinEmailList(input: JoinEmailListInput) {
    const { profileId, emailListId, email } = input;
    const profile = await this.database.models.Profile.findOne({ id: profileId });
    if (!profile) {
      throw new NotFoundError("Profile not found");
    }

    const emailList = emailListId
      ? await this.database.models.EmailList.findOne({ id: emailListId, profileId })
      : await this.database.models.EmailList.findOne({ profileId, isDefault: true });

    if (!emailList) {
      throw new NotFoundError("Email list not found");
    }

    await this.models.EmailListSubscriber.insertOne({
      emailListId: emailList.id,
      email,
    });

    return;
  }

  public async unsubscribeFromEmailList({ subscriberId }: UnsubscribeFromEmailListInput) {
    if (!subscriberId) {
      return;
    }
    await this.database.models.EmailListSubscriber.deleteOne({ id: subscriberId });

    return;
  }
}
