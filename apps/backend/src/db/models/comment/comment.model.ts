import { Kysely, sql } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export class CommentModel extends BaseModel<"comments", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "comments", "id");
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
    return this.insertOne({ entityId, entityType, accountId, content });
  }

  async delete(id: string) {
    return this.updateOne({ id }, { archivedAt: new Date() });
  }

  async findMany({
    entityId,
    entityType,
    page = 1,
    limit = 20,
    archived = false,
  }: {
    entityId: string;
    entityType: string;
    page?: number;
    limit?: number;
    archived?: boolean;
  }) {
    const skip = (page - 1) * limit;
    const data = await this.client
      .selectFrom("comments")
      .where("archivedAt", archived ? "is not" : "is", null)
      .where("entityId", "=", entityId)
      .where("entityType", "=", entityType)
      .where("content", "is not", null)
      .fullJoin("accounts", "comments.accountId", "accounts.id")
      .selectAll("comments")
      .select([sql`first_name || ' ' || last_name`.as("fullName")])
      .limit(limit)
      .offset(skip)
      .orderBy("comments.createdAt", "desc")
      .execute();

    return data;
  }
}
