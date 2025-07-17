import { BaseService, BaseServiceArgs } from "../../baseService";

export class SavesService extends BaseService {
  constructor(args: BaseServiceArgs) {
    super(args);
  }

  async create({ entityId, entityType, accountId }: { entityId: string; entityType: string; accountId: string }) {
    return this.database.models.Saved.create({ entityId, entityType, accountId });
  }

  async delete({ entityId, entityType, accountId }: { entityId: string; entityType: string; accountId: string }) {
    return this.database.models.Saved.delete({ entityId, entityType, accountId });
  }

  async exists({ entityId, entityType, accountId }: { entityId: string; entityType: string; accountId: string }) {
    return this.database.models.Saved.exists({ entityId, entityType, accountId });
  }

  async count({ entityId, entityType }: { entityId: string; entityType: string }) {
    return this.database.models.Saved.count({ entityId, entityType });
  }
}
