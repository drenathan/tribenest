import { OrderStatus } from "@src/db/types/product";
import { InitRouteFunction } from "@src/types";
import { Router } from "express";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();

  router.post("/:storeId", async (req, res) => {
    switch (req.body.type) {
      case "order_failed":
        await services.admin.orders.updateOrderDeliveryGroupStatus({
          id: req.body.data.order.id,
          status: OrderStatus.Failed,
        });
        break;
      case "order_cancelled":
        await services.admin.orders.updateOrderDeliveryGroupStatus({
          id: req.body.data.order.id,
          status: OrderStatus.Cancelled,
        });
        break;
      case "order_updated":
        await services.admin.orders.updateOrderDeliveryGroupStatus({
          id: req.body.data.order.id,
          status: req.body.data.order.status,
        });
        break;
      default:
        break;
    }
    res.sendStatus(200);
  });

  return router;
};

export default {
  path: "/public/webhooks/printful",
  init,
};
