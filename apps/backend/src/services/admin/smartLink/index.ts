import {
  CreateSmartLinkInput,
  GetManySmartLinksInput,
  GetSmartLinkAnalyticsInput,
  UpdateSmartLinkInput,
} from "@src/routes/smartLinks/schema";
import { BaseService } from "@src/services/baseService";
import { BadRequestError, NotFoundError } from "@src/utils/app_error";
import { TrackEventInput } from "./types";
import { logger } from "@src/utils/logger";

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

  async trackEvent(input: TrackEventInput) {
    const { ip, eventType, eventData } = input;
    let geoLookup = {};
    if (ip) {
      try {
        geoLookup = await this.apis.ipLookup(ip);
      } catch (error) {
        logger.error(`Error looking up IP ${ip}: ${error}`);
      }
    }
    const link = await this.models.SmartLink.getOneById({ path: input.path });
    if (!link) {
      throw new BadRequestError("Smart link not found");
    }

    await this.models.SmartLinkEvent.insertOne({
      smartLinkId: link.id,
      eventType,
      eventData: {
        ...geoLookup,
        ...eventData,
      },
    });
  }

  public async getSmartLinkAnalytics(input: GetSmartLinkAnalyticsInput & { smartLinkId: string }) {
    return this.models.SmartLinkEvent.getMany(input);
  }

  public async archiveSmartLink(input: { smartLinkId: string; profileId: string }) {
    await this.models.SmartLink.updateOne(
      { id: input.smartLinkId, profileId: input.profileId },
      { archivedAt: new Date() },
    );
    return true;
  }

  public async unarchiveSmartLink(input: { smartLinkId: string; profileId: string }) {
    await this.models.SmartLink.updateOne({ id: input.smartLinkId, profileId: input.profileId }, { archivedAt: null });
    return true;
  }
}
