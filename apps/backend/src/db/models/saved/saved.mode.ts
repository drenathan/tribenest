import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export class SavedModel extends BaseModel<"saves", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "saves", "id");
  }

  async create({ entityId, entityType, accountId }: { entityId: string; entityType: string; accountId: string }) {
    return this.insertOne({ entityId, entityType, accountId });
  }

  async delete({ entityId, entityType, accountId }: { entityId: string; entityType: string; accountId: string }) {
    return this.deleteOne({ entityId, entityType, accountId });
  }

  public async isSavedByUser(entityId: string, entityType: string, accountId: string): Promise<boolean> {
    return this.exists({ entityId, entityType, accountId });
  }

  public async getSavedEntitiesByUser(accountId: string, entityType: string, page: number = 1, limit: number = 10) {
    const skip = (page - 1) * limit;

    const total = await this.client
      .selectFrom("saves")
      .where("accountId", "=", accountId)
      .where("entityType", "=", entityType)
      .where("archivedAt", "is", null)
      .select((eb) => [eb.fn.countAll().as("total")])
      .executeTakeFirstOrThrow();

    const data = await this.client
      .selectFrom("saves as s")
      .where("s.accountId", "=", accountId)
      .where("s.entityType", "=", entityType)
      .where("s.archivedAt", "is", null)
      .select(["s.entityId", "s.createdAt as savedAt"])
      .orderBy("s.createdAt", "desc")
      .limit(limit)
      .offset(skip)
      .execute();

    return {
      data,
      total: total.total,
    };
  }
}
