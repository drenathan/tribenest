import { Expression, Kysely, sql, SqlBool } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";
import { PaginatedData } from "@src/types";
import { OrderStatus } from "@src/db/types/product";
type GetOrdersInput = {
  profileId: string;
  page: number;
  limit: number;
  filter?: OrderFilters;
};

type OrderFilters = {
  status?: string;
  query?: string;
  orderId?: string;
};

export class EventTicketOrderModel extends BaseModel<"eventTicketOrders", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "eventTicketOrders", "id");
  }
  public async getOrderById(input: { orderId: string; profileId: string }) {
    const result = await this.getProfileOrders({
      ...input,
      filter: { orderId: input.orderId },
      page: 1,
      limit: 1,
    });

    return result.data[0];
  }

  public async getProfileOrders(input: GetOrdersInput) {
    const { profileId, page, limit } = input;
    const offset = (page - 1) * limit;

    const { status, query, orderId } = (input.filter ?? {}) as OrderFilters;

    const filterQuery = this.client
      .selectFrom("eventTicketOrders as eto")
      .fullJoin("events as e", "eto.eventId", "e.id")
      .where((eb) => {
        const conditions: Expression<SqlBool>[] = [];

        conditions.push(eb("e.profileId", "=", profileId));
        if (!orderId) {
          conditions.push(eb("eto.status", "!=", OrderStatus.InitiatedPayment));
        }

        if (orderId) {
          conditions.push(eb("eto.id", "=", orderId));
        }

        if (status && status !== "all") {
          conditions.push(eb("eto.status", "=", status as OrderStatus));
        }

        if (query?.length) {
          conditions.push(
            eb.or([
              eb("e.title", "ilike", `%${query}%`),
              eb("eto.lastName", "ilike", `%${query}%`),
              eb("eto.lastName", "ilike", `%${query}%`),
              eb("eto.email", "ilike", `%${query}%`),
            ]),
          );
        }

        return eb.and(conditions);
      });

    const total = await filterQuery.select((eb) => eb.fn.countAll().as("total")).executeTakeFirstOrThrow();

    const data = await filterQuery
      .orderBy("eto.createdAt", "desc")
      .selectAll("eto")
      .select("e.title as eventTitle")
      .select((eb) => [
        sql`eto.first_name || ' ' || eto.last_name`.as("customerName"),
        eb.ref("eto.email").as("customerEmail"),
        this.jsonArrayFrom(
          eb
            .selectFrom("eventTicketOrderItems as etoi")
            .whereRef("etoi.eventTicketOrderId", "=", "eto.id")
            .fullJoin("eventTickets as et", "etoi.eventTicketId", "et.id")
            .select((eb) => [
              eb.ref("et.title").as("title"),
              eb.ref("etoi.quantity").as("quantity"),
              eb.ref("etoi.price").as("price"),
              eb.ref("et.id").as("eventTicketId"),
              eb.ref("etoi.id").as("id"),
            ]),
        ).as("items"),
      ])
      .limit(input.limit)
      .offset(offset)
      .execute();

    const hasNextPage = data.length === limit;

    return {
      data,
      total: Number(total.total),
      hasNextPage,
      page,
      pageSize: limit,
      nextPage: hasNextPage ? page + 1 : null,
    };
  }
}
