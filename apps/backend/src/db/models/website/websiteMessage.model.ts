import { Kysely, Selectable } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";
import { PaginatedData } from "@src/types";
import { GetMessagesInput } from "@src/routes/websites/schema";

export type IWebsiteMessage = DB["websiteMessages"];

export class WebsiteMessageModel extends BaseModel<"websiteMessages", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "websiteMessages", "id");
  }

  public async getMany(input: GetMessagesInput): Promise<PaginatedData<Selectable<IWebsiteMessage>>> {
    const offset = (input.page - 1) * input.limit;
    const filterQuery = this.client.selectFrom("websiteMessages as wm").where("wm.profileId", "=", input.profileId);

    const count = await filterQuery.select(({ fn }) => fn.countAll().as("count")).executeTakeFirst();
    const data = await filterQuery
      .selectAll()
      .orderBy("wm.createdAt", "desc")
      .limit(input.limit)
      .offset(offset)
      .execute();
    const hasNextPage = data.length === input.limit;

    return {
      data,
      total: Number(count?.count ?? 0),
      page: input.page,
      pageSize: input.limit,
      hasNextPage,
      nextPage: hasNextPage ? input.page + 1 : null,
    };
  }
}
