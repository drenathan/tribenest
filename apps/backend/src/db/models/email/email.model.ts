import { Expression, Kysely, SqlBool } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";
import { GetEmailsInput } from "@src/routes/emails/schema";
import { PaginatedData } from "@src/types";
import { EmailStatus } from "@src/db/types/email";

export type IEmail = DB["emails"];

type EmailFilter = {
  query?: string;
  emailTemplateId?: string;
  emailListId?: string;
  status?: string;
};
export class EmailModel extends BaseModel<"emails", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "emails", "id");
  }

  public async getMany(input: GetEmailsInput): Promise<PaginatedData<{}>> {
    const { query, emailTemplateId, emailListId, status } = input.filter as EmailFilter;
    const offset = (input.page - 1) * input.limit;

    const filterQuery = this.client.selectFrom("emails").where((eb) => {
      const conditions: Expression<SqlBool>[] = [];
      if (query) {
        conditions.push(eb("emails.title", "ilike", `%${query}%`));
      }
      if (emailTemplateId) {
        conditions.push(eb("emails.emailTemplateId", "=", emailTemplateId));
      }
      if (emailListId) {
        conditions.push(eb("emails.emailListId", "=", emailListId));
      }
      if (status) {
        conditions.push(eb("emails.status", "=", status as EmailStatus));
      }
      return eb.and(conditions);
    });

    const total = await filterQuery.select(({ fn }) => fn.countAll().as("total")).executeTakeFirstOrThrow();

    const data = await filterQuery
      .leftJoin("emailLists", "emailLists.id", "emails.emailListId")
      .selectAll("emails")
      .select((eb) => [eb.ref("emailLists.title").as("emailListTitle")])
      .orderBy("emails.createdAt", "desc")
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

  public async getOne({ emailId }: { emailId: string }) {
    const data = await this.findById(emailId);
    return data;
  }
}
