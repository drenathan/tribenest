import { BaseService } from "../baseService";

export class ProfileAuthorizationService extends BaseService {
  public async isOwner({ profileId, accountId }: { profileId: string; accountId: string }): Promise<boolean> {
    const authorization = await this.models.ProfileAuthorization.findOne({
      profileId,
      accountId,
      isOwner: true,
    });

    return !!authorization;
  }
}
