import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { PublicEmailLists } from "./controller";
import { publicAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new PublicEmailLists(services, workers);

  router.use((req, _, next) => publicAuthentication(req, next, services));
  router.post("/join", (...args) => controller.joinEmailList(...args));
  router.get("/unsubscribe", (...args) => controller.unsubscribeFromEmailList(...args));
  return router;
};

export default {
  path: "/public/email-lists",
  init,
};
