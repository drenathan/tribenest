import { GetOrdersInput } from "@src/routes/orders/schema";
import { BaseService } from "../../baseService";
import { BadRequestError, NotFoundError } from "@src/utils/app_error";
import { OrderStatus, ProductDeliveryType } from "@src/db/types/product";
import { wait } from "@src/utils/wait";

export class OrderService extends BaseService {
  public async getOrders(input: GetOrdersInput) {
    return this.models.Order.getProfileOrders(input);
  }

  public async updateOrderDeliveryGroupStatus(input: { id: string; status: OrderStatus }) {
    await this.models.OrderDeliveryGroup.updateOne({ externalId: input.id }, { status: input.status });
  }

  public async getOrderById(input: { orderId: string; profileId: string }) {
    return this.models.Order.getOrderById(input);
  }

  public async fullFillOrder(input: { deliveryGroupId: string; profileId: string }) {
    const deliveryGroup = await this.models.OrderDeliveryGroup.findOne({
      id: input.deliveryGroupId,
    });

    if (!deliveryGroup) {
      throw new NotFoundError("Delivery group not found");
    }

    if (deliveryGroup.deliveryType === ProductDeliveryType.Digital) {
      throw new BadRequestError("Digital delivery group cannot be fulfilled");
    }

    const order = await this.models.Order.findOne({
      id: deliveryGroup.orderId!,
    });

    if (!order) {
      throw new NotFoundError("Order not found");
    }

    if (order.status !== OrderStatus.Paid) {
      throw new BadRequestError("Order is not paid");
    }
    if (!deliveryGroup.productStoreId) {
      throw new BadRequestError("Product store not found");
    }

    const productStore = await this.models.ProductStore.findById(deliveryGroup.productStoreId);

    if (!productStore) {
      throw new NotFoundError("Product store not found");
    }

    const decryptedToken = this.apis.encryption.decrypt(productStore.accessToken);

    const productStoreApi = await this.apis.getExternalStore(productStore.provider, decryptedToken);
    await productStoreApi.confirmOrder(deliveryGroup.externalId!);
    await this.models.OrderDeliveryGroup.updateOne({ id: deliveryGroup.id }, { status: OrderStatus.Submitted });
  }
}
