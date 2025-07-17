import { BaseService, BaseServiceArgs } from "../../baseService";

export class CommentsService extends BaseService {
  constructor(args: BaseServiceArgs) {
    super(args);
  }

  async create({
    entityId,
    entityType,
    accountId,
    content,
  }: {
    entityId: string;
    entityType: string;
    accountId: string;
    content: string;
  }) {
    return this.database.models.Comment.create({ entityId, entityType, accountId, content });
  }

  async delete(id: string) {
    return this.database.models.Comment.delete(id);
  }

  async findMany({
    entityId,
    entityType,
    page = 1,
    limit = 20,
  }: {
    entityId: string;
    entityType: string;
    page?: number;
    limit?: number;
  }) {
    return this.database.models.Comment.findMany({ entityId, entityType, page, limit });
  }

  async count({ entityId, entityType }: { entityId: string; entityType: string }) {
    return this.database.models.Comment.count({ entityId, entityType, archivedAt: null });
  }

  async findById(id: string) {
    return this.database.models.Comment.findById(id);
  }
}
