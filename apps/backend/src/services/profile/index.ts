import { BadRequestError } from "@src/utils/app_error";
import { BaseService } from "../baseService";
import { FORBIDDEN_SUBDOMAINS } from "./contants";
import { CreateProfileInput, GetMediaInput, UploadMediaInput } from "@src/routes/profiles/schema";
import { safeStringify } from "@src/utils/json";
import { MediaParent } from "@src/db/types/media";

export class ProfileService extends BaseService {
  public async validateSubdomain(name: string) {
    if (FORBIDDEN_SUBDOMAINS.includes(name)) {
      return false;
    }
    const profile = await this.database.models.Profile.findOne({ name });
    if (profile) {
      return false;
    }
    return true;
  }

  public async createProfile({ name, subdomain }: CreateProfileInput, accountId: string) {
    const isValidName = await this.validateSubdomain(subdomain);
    if (!isValidName) {
      throw new BadRequestError("Invalid profile name");
    }
    const trx = await this.database.client.startTransaction().execute();

    try {
      const profile = await this.database.models.Profile.insertOne({ name, subdomain }, trx);
      const profileAuthorization = await this.database.models.ProfileAuthorization.insertOne(
        { profileId: profile.id, accountId, isOwner: true },
        trx,
      );

      await trx.commit().execute();

      return { profile, profileAuthorization };
    } catch (error) {
      await trx.rollback().execute();
      throw error;
    }
  }

  public async uploadMedia(input: UploadMediaInput, profileId: string) {
    const { url, type, parent, name, size } = input;
    const media = await this.database.models.Media.insertOne({
      url,
      type,
      parent: parent as MediaParent,
      name,
      size,
      profileId,
    });
    return media;
  }

  public async getMedia(input: GetMediaInput, profileId: string) {
    const { parent, type } = input;
    const media = await this.database.models.Media.find({ profileId, parent: parent as MediaParent, type }, (qb) =>
      qb.orderBy("createdAt", "desc"),
    );
    console.log(safeStringify(media));
    return media;
  }

  public async getProfile(profileId: string) {
    const profile = await this.database.models.Profile.getProfile(profileId);
    return profile;
  }
}
