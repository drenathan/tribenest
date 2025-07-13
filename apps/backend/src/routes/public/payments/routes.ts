import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { PublicPayments } from "./controller";
import { publicAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new PublicPayments(services, workers);

  router.use((req, _, next) => publicAuthentication(req, next, services));
  router.post("/start", (...args) => controller.startPayment(...args));
  return router;
};

export default {
  path: "/public/payments",
  init,
};
