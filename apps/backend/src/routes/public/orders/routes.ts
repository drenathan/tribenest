import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { PublicOrders } from "./controller";
import { publicAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new PublicOrders(services, workers);

  router.use((req, _, next) => publicAuthentication(req, next, services));
  router.post("/", (...args) => controller.createOrder(...args));
  router.post("/finalize", (...args) => controller.finalizeOrder(...args));
  return router;
};

export default {
  path: "/public/orders",
  init,
};
