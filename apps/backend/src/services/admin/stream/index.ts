import {
  CreateStreamTemplateInput,
  GetStreamTemplatesInput,
  UpdateStreamTemplateInput,
} from "@src/routes/stream/schema";
import { BaseService } from "@src/services/baseService";

export class StreamsService extends BaseService {
  public async getStreamTemplates(input: GetStreamTemplatesInput) {
    const templates = await this.models.StreamTemplate.find({ profileId: input.profileId });
    return {
      data: templates,
      total: templates.length,
      page: input.page,
      pageSize: templates.length,
      hasNextPage: false,
      nextPage: null,
    };
  }

  public async getStreamTemplate({ templateId, profileId }: { templateId: string; profileId: string }) {
    const template = await this.models.StreamTemplate.findOne({ id: templateId, profileId });
    return template;
  }

  public async createStreamTemplate(input: CreateStreamTemplateInput) {
    const template = await this.models.StreamTemplate.insertOne({
      profileId: input.profileId,
      title: input.title,
      description: input.description,
      scenes: JSON.stringify(input.scenes),
      config: JSON.stringify(input.config),
    });
    return template;
  }

  public async updateStreamTemplate(input: UpdateStreamTemplateInput) {
    await this.models.StreamTemplate.updateOne(
      { id: input.id },
      {
        title: input.title,
        description: input.description,
        scenes: JSON.stringify(input.scenes),
        config: JSON.stringify(input.config),
      },
    );

    return true;
  }
}
