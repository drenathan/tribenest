import { Expression, Kysely, SqlBool } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";
import { PaginatedData } from "@src/types";
import { GetEmailTemplatesInput } from "@src/routes/emails/schema";
export type IEmailTemplate = DB["emailTemplates"];
type EmailTemplateFilter = {
  query?: string;
};

export class EmailTemplateModel extends BaseModel<"emailTemplates", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "emailTemplates", "id");
  }

  public async getMany(input: GetEmailTemplatesInput): Promise<PaginatedData<{}>> {
    const { query } = input.filter as EmailTemplateFilter;
    const offset = (input.page - 1) * input.limit;

    const filterQuery = this.client.selectFrom("emailTemplates").where((eb) => {
      const conditions: Expression<SqlBool>[] = [];
      if (query) {
        conditions.push(eb("emailTemplates.title", "ilike", `%${query}%`));
      }
      return eb.and(conditions);
    });

    const total = await filterQuery.select(({ fn }) => fn.countAll().as("total")).executeTakeFirstOrThrow();

    const data = await filterQuery
      .selectAll("emailTemplates")
      .orderBy("emailTemplates.createdAt", "desc")
      .limit(input.limit)
      .offset(offset)
      .execute();

    const hasNextPage = data.length === input.limit;
    return {
      data,
      total: Number(total.total),
      hasNextPage,
      page: input.page,
      nextPage: hasNextPage ? input.page + 1 : null,
      pageSize: input.limit,
    };
  }

  public async getOne({ emailTemplateId }: { emailTemplateId: string }) {
    const data = await this.findById(emailTemplateId);
    return data;
  }
}
