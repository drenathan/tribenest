import { CreateSmartLinkInput, GetManySmartLinksInput, UpdateSmartLinkInput } from "@src/routes/smartLinks/schema";
import { BaseService } from "@src/services/baseService";
import { BadRequestError, NotFoundError } from "@src/utils/app_error";

export class SmartLinkService extends BaseService {
  public async createSmartLink(input: CreateSmartLinkInput) {
    const existingSmartLink = await this.models.SmartLink.exists({ path: input.path });
    if (existingSmartLink) {
      throw new BadRequestError("Smart link path is not available");
    }

    await this.models.SmartLink.insertOne({
      path: input.path,
      title: input.title,
      description: input.description,
      profileId: input.profileId,
      content: input.content,
      themeSettings: input.themeSettings,
      template: input.template,
      thumbnail: input.thumbnail,
    });

    return true;
  }

  public async updateSmartLink(input: UpdateSmartLinkInput & { smartLinkId: string }) {
    const smartLink = await this.models.SmartLink.findById(input.smartLinkId);
    if (!smartLink) {
      throw new NotFoundError("Smart link not found");
    }
    const isChangingPath = smartLink.path !== input.path;
    if (isChangingPath) {
      const existingSmartLink = await this.models.SmartLink.exists({ path: input.path });
      if (existingSmartLink) {
        throw new BadRequestError("Smart link path is not available");
      }
    }

    await this.models.SmartLink.updateOne(
      { id: input.smartLinkId },
      {
        path: input.path,
        title: input.title,
        description: input.description,
        content: input.content,
        themeSettings: input.themeSettings,
        thumbnail: input.thumbnail,
      },
    );
  }

  public async getManySmartLinks(input: GetManySmartLinksInput) {
    return this.models.SmartLink.getMany(input);
  }

  public async getSmartLink(input: { smartLinkId?: string; path?: string }) {
    return this.models.SmartLink.getOneById(input);
  }
}
