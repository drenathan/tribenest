import { Expression, Kysely, SqlBool } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";
import { GetEmailListsInput } from "@src/routes/emails/schema";
import { PaginatedData } from "@src/types";

export type IEmailList = DB["emailLists"];
type EmailListFilter = {
  query?: string;
};

export class EmailListModel extends BaseModel<"emailLists", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "emailLists", "id");
  }

  public async getMany(input: GetEmailListsInput): Promise<PaginatedData<{}>> {
    const { query } = input.filter as EmailListFilter;
    const offset = (input.page - 1) * input.limit;

    const filterQuery = this.client.selectFrom("emailLists").where((eb) => {
      const conditions: Expression<SqlBool>[] = [];
      if (query) {
        conditions.push(eb("emailLists.title", "ilike", `%${query}%`));
      }
      return eb.and(conditions);
    });

    const total = await filterQuery.select(({ fn }) => fn.countAll().as("total")).executeTakeFirstOrThrow();

    const data = await filterQuery
      .leftJoin("emailListSubscribers", "emailLists.id", "emailListSubscribers.emailListId")
      .groupBy("emailLists.id")
      .selectAll("emailLists")
      .select((eb) => eb.fn.count("emailListSubscribers.id").as("subscriberCount"))
      .orderBy("emailLists.createdAt", "desc")
      .limit(input.limit)
      .offset(offset)
      .execute();

    const hasNextPage = data.length === input.limit;
    return {
      data: data.map((item) => ({
        ...item,
        subscriberCount: Number(item.subscriberCount),
      })),
      total: Number(total.total),
      hasNextPage,
      page: input.page,
      nextPage: hasNextPage ? input.page + 1 : null,
      pageSize: input.limit,
    };
  }

  public async getOne({ emailListId }: { emailListId: string }) {
    const data = await this.client
      .selectFrom("emailLists")
      .where("emailLists.id", "=", emailListId)
      .leftJoin("emailListSubscribers", "emailLists.id", "emailListSubscribers.emailListId")
      .selectAll("emailLists")
      .select((eb) => eb.fn.count("emailListSubscribers.id").as("subscriberCount"))
      .executeTakeFirstOrThrow();

    return data ? { ...data, subscriberCount: Number(data.subscriberCount) } : null;
  }
}
