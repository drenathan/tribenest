import { BaseService, BaseServiceArgs } from "../../baseService";

export class LikesService extends BaseService {
  constructor(args: BaseServiceArgs) {
    super(args);
  }

  async create({ entityId, entityType, accountId }: { entityId: string; entityType: string; accountId: string }) {
    return this.database.models.Like.create({ entityId, entityType, accountId });
  }

  async delete({ entityId, entityType, accountId }: { entityId: string; entityType: string; accountId: string }) {
    return this.database.models.Like.delete({ entityId, entityType, accountId });
  }

  async exists({ entityId, entityType, accountId }: { entityId: string; entityType: string; accountId: string }) {
    return this.database.models.Like.exists({ entityId, entityType, accountId });
  }

  async count({ entityId, entityType }: { entityId: string; entityType: string }) {
    return this.database.models.Like.count({ entityId, entityType });
  }
}
