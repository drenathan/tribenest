import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { PublicOrders } from "./controller";
import { publicAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new PublicOrders(services, workers);
  const throwOnUnauthenticated = true;

  router.get(
    "/",
    (req, _, next) => publicAuthentication(req, next, services, throwOnUnauthenticated),
    (...args) => controller.getOrders(...args),
  );
  router.post(
    "/",
    (req, _, next) => publicAuthentication(req, next, services),
    (...args) => controller.createOrder(...args),
  );
  router.post(
    "/finalize",
    (req, _, next) => publicAuthentication(req, next, services),
    (...args) => controller.finalizeOrder(...args),
  );
  return router;
};

export default {
  path: "/public/orders",
  init,
};
