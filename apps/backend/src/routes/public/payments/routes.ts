import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { PublicPayments } from "./controller";
import { publicAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new PublicPayments(services, workers);
  const throwOnError = true;

  router.post(
    "/start",
    (req, _, next) => publicAuthentication(req, next, services),
    (...args) => controller.startPayment(...args),
  );
  router.post(
    "/subscriptions",
    (req, _, next) => publicAuthentication(req, next, services, throwOnError),
    (...args) => controller.createSubscription(...args),
  );
  return router;
};

export default {
  path: "/public/payments",
  init,
};
