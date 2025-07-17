import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export class LikeModel extends BaseModel<"likes", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "likes", "id");
  }

  async create({ entityId, entityType, accountId }: { entityId: string; entityType: string; accountId: string }) {
    const exists = await this.exists({ entityId, entityType, accountId });
    if (exists) {
      return;
    }
    return this.insertOne({ entityId, entityType, accountId });
  }

  async delete({ entityId, entityType, accountId }: { entityId: string; entityType: string; accountId: string }) {
    return this.deleteOne({ entityId, entityType, accountId });
  }
}
