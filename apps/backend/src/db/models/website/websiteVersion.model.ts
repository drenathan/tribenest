import { Expression, Kysely, sql, SqlBool } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export class WebsiteVersionModel extends BaseModel<"websiteVersions", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "websiteVersions", "id");
  }

  public async getOneWithPages({
    websiteVersionId,
    profileId,
    isActive,
  }: {
    websiteVersionId?: string;
    profileId: string;
    isActive?: boolean;
  }) {
    const theme = await this.client
      .selectFrom("websiteVersions as wv")
      .where("wv.profileId", "=", profileId)
      .where(({ eb }) => {
        const ands: Expression<SqlBool>[] = [];
        if (isActive) {
          ands.push(eb("wv.isActive", "=", isActive));
        }
        if (websiteVersionId) {
          ands.push(eb("wv.id", "=", websiteVersionId));
        }
        return eb.and(ands);
      })
      .selectAll()
      .select((eb) => [
        this.jsonArrayFrom(
          eb
            .selectFrom("websiteVersionPages as wvp")
            .select(["wvp.title", "wvp.pathname", sql`wvp.content`.as("content")])
            .whereRef("wvp.websiteVersionId", "=", "wv.id"),
        ).as("pages"),
      ])
      .executeTakeFirst();
    return theme;
  }

  public async getManyWithPages({ profileId }: { profileId: string }) {
    const themes = await this.client
      .selectFrom("websiteVersions as wv")
      .where("wv.profileId", "=", profileId)
      .selectAll()
      .select((eb) => [
        this.jsonArrayFrom(
          eb.selectFrom("websiteVersionPages as wvp").selectAll().whereRef("wvp.websiteVersionId", "=", "wv.id"),
        ).as("pages"),
      ])
      .orderBy("wv.isActive", "desc")
      .orderBy("wv.createdAt", "desc")
      .execute();
    return themes;
  }
}
