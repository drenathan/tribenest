import { Expression, Kysely, SqlBool } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";
import { BadRequestError } from "@src/utils/app_error";
export type IOrder = DB["orders"];

type GetOrdersInput = {
  paymentId?: string;
  orderId?: string;
  accountId?: string;
  limit?: number;
};

type GetOrderInput = {
  paymentId?: string;
  orderId?: string;
};

export class OrderModel extends BaseModel<"orders", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "orders", "id");
  }

  public async getUserOrders(input: GetOrdersInput) {
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
            .selectFrom("orderItems")
            .selectAll()
            .whereRef("orderId", "=", "orders.id")
            .orderBy("orderItems.createdAt", "asc"),
        ).as("items"),
      ])
      .orderBy("orders.createdAt", "desc")
      .limit(input.limit ?? 10)
      .execute();

    return result;
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
