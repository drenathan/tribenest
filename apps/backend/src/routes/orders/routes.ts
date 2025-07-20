import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { OrdersController } from "./controller";
import { requireAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new OrdersController(services, workers);
  router.use((req, _, next) => requireAuthentication(req, next, services));
  router.get("/", (...args) => controller.getOrders(...args));

  return router;
};

export default {
  path: "/orders",
  init,
};
