import { GetOrdersInput } from "@src/routes/orders/schema";
import { BaseService } from "../../baseService";

export class OrderService extends BaseService {
  public async getOrders(input: GetOrdersInput) {
    return this.models.Order.getProfileOrders(input);
  }
}
