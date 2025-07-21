import { Expression, Kysely, SqlBool } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";
import { GetManySmartLinksInput } from "@src/routes/smartLinks/schema";
import { PaginatedData } from "@src/types";
import { BadRequestError } from "@src/utils/app_error";

export type ISmartLink = DB["smartLinks"];

type SmartLinkFilter = {
  archived?: string;
  query?: string;
};

export class SmartLinkModel extends BaseModel<"smartLinks", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "smartLinks", "id");
  }

  public async getOneById(input: { smartLinkId?: string; path?: string }) {
    if (!input.smartLinkId && !input.path) {
      throw new BadRequestError("Invalid input");
    }

    return this.client
      .selectFrom("smartLinks")
      .where((eb) => {
        const conditions: Expression<SqlBool>[] = [];
        if (input.smartLinkId) {
          conditions.push(eb("smartLinks.id", "=", input.smartLinkId));
        }
        if (input.path) {
          conditions.push(eb("smartLinks.path", "=", input.path));
        }
        return eb.and(conditions);
      })
      .selectAll("smartLinks")
      .select((eb) => [
        this.jsonObjectFrom(
          eb
            .selectFrom("profiles")
            .whereRef("profiles.id", "=", "smartLinks.profileId")
            .select(["profiles.name", "profiles.id"]),
        ).as("profile"),
      ])
      .executeTakeFirst();
  }

  public async getMany(input: GetManySmartLinksInput): Promise<PaginatedData<{}>> {
    const { archived, query } = (input.filter ?? {}) as SmartLinkFilter;
    const isArchived = archived === "true";
    const offset = (input.page - 1) * input.limit;

    const filterQuery = this.client.selectFrom("smartLinks").where((eb) => {
      const conditions: Expression<SqlBool>[] = [];
      conditions.push(eb("smartLinks.profileId", "=", input.profileId));
      if (query) {
        conditions.push(eb("smartLinks.title", "ilike", `%${query}%`));
      }

      if (isArchived) {
        conditions.push(eb("smartLinks.archivedAt", "is not", null));
      } else {
        conditions.push(eb("smartLinks.archivedAt", "is", null));
      }

      return eb.and(conditions);
    });

    const total = await filterQuery.select(({ fn }) => fn.countAll().as("total")).executeTakeFirstOrThrow();

    if (!total.total) {
      return {
        data: [],
        total: 0,
        page: input.page,
        pageSize: input.limit,
        hasNextPage: false,
        nextPage: null,
      };
    }

    const data = await filterQuery
      .selectAll("smartLinks")
      .orderBy("smartLinks.createdAt", "desc")
      .limit(input.limit)
      .offset(offset)
      .execute();
    const hasNextPage = data.length === input.limit;

    return {
      data,
      total: Number(total.total),
      page: input.page,
      pageSize: input.limit,
      hasNextPage,
      nextPage: hasNextPage ? input.page + 1 : null,
    };
  }
}
