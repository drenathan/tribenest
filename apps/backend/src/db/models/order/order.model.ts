import { Expression, Kysely, sql, SqlBool } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";
import { BadRequestError } from "@src/utils/app_error";
import { OrderStatus } from "@src/db/types/product";
import { GetOrdersInput } from "@src/routes/orders/schema";
import { PaginatedData } from "@src/types";
export type IOrder = DB["orders"];

type GetUserOrdersInput = {
  paymentId?: string;
  orderId?: string;
  accountId?: string;
  limit?: number;
};

type GetOrderInput = {
  paymentId?: string;
  orderId?: string;
};

type OrderFilters = {
  status?: string;
  query?: string;
  orderId?: string;
};

export class OrderModel extends BaseModel<"orders", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "orders", "id");
  }

  public async getUserOrders(input: GetUserOrdersInput) {
    const { paymentId, orderId, accountId } = input;
    if (!accountId && !orderId && !paymentId) {
      throw new BadRequestError("Either accountId, orderId or paymentId is required");
    }

    const result = await this.client
      .selectFrom("orders")
      .where((eb) => {
        const conditions: Expression<SqlBool>[] = [];
        if (paymentId) {
          conditions.push(eb("orders.paymentId", "=", paymentId));
        }
        if (orderId) {
          conditions.push(eb("orders.id", "=", orderId));
        }
        if (accountId) {
          conditions.push(eb("orders.accountId", "=", accountId));
        }
        return eb.and(conditions);
      })
      .selectAll()
      .select((eb) => [
        this.jsonArrayFrom(
          eb
            .selectFrom("orderDeliveryGroups")
            .whereRef("orderId", "=", "orders.id")
            .orderBy("orderDeliveryGroups.createdAt", "asc")
            .selectAll()
            .select((eb) => [
              this.jsonArrayFrom(
                eb
                  .selectFrom("orderItems")
                  .whereRef("orderDeliveryGroupId", "=", "orderDeliveryGroups.id")
                  .orderBy("orderItems.createdAt", "asc")
                  .selectAll(),
              ).as("items"),
            ]),
        ).as("deliveryGroups"),
      ])
      .orderBy("orders.createdAt", "desc")
      .limit(input.limit ?? 10)
      .execute();

    return result;
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

  public async getProfileOrders(input: GetOrdersInput): Promise<PaginatedData<{}>> {
    const { profileId, page, limit } = input;
    const offset = (page - 1) * limit;

    const { status, query, orderId } = (input.filter ?? {}) as OrderFilters;

    const filterQuery = this.client
      .selectFrom("orders")
      .leftJoin("accounts as a", "orders.accountId", "a.id")
      .where((eb) => {
        const conditions: Expression<SqlBool>[] = [];

        conditions.push(eb("orders.profileId", "=", profileId));
        conditions.push(eb("orders.status", "!=", OrderStatus.InitiatedPayment));

        if (orderId) {
          conditions.push(eb("orders.id", "=", orderId));
        }

        if (status && status !== "all") {
          conditions.push(eb("orders.status", "=", status as OrderStatus));
        }

        if (query?.length) {
          conditions.push(
            eb.or([
              eb("a.firstName", "ilike", `%${query}%`),
              eb("orders.lastName", "ilike", `%${query}%`),
              eb("a.lastName", "ilike", `%${query}%`),
              eb("orders.firstName", "ilike", `%${query}%`),
            ]),
          );
        }

        return eb.and(conditions);
      });

    const total = await filterQuery.select((eb) => eb.fn.countAll().as("total")).executeTakeFirstOrThrow();

    const data = await filterQuery
      .orderBy("orders.createdAt", "desc")
      .selectAll("orders")
      .select((eb) => [
        sql`a.first_name || ' ' || a.last_name`.as("customerName"),
        eb.ref("orders.email").as("customerEmail"),
        this.jsonArrayFrom(
          eb
            .selectFrom("orderDeliveryGroups")
            .whereRef("orderId", "=", "orders.id")
            .orderBy("orderDeliveryGroups.createdAt", "asc")
            .selectAll()
            .select((eb) => [
              this.jsonArrayFrom(
                eb
                  .selectFrom("orderItems")
                  .whereRef("orderDeliveryGroupId", "=", "orderDeliveryGroups.id")
                  .orderBy("orderItems.createdAt", "asc")
                  .selectAll(),
              ).as("items"),
            ]),
        ).as("deliveryGroups"),
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

  public async getUserOrder(input: GetOrderInput) {
    const { paymentId, orderId } = input;
    if (!orderId && !paymentId) {
      throw new BadRequestError("Either accountId, orderId or paymentId is required");
    }
    const [order] = await this.getUserOrders({
      orderId,
      paymentId,
    });

    return order;
  }
}
