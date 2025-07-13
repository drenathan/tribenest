import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { SessionsController } from "./controller";
import { requireAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new SessionsController(services, workers);
  router.post("/", (...args) => controller.createSession(...args));
  router.delete(
    "/",
    (req, _, next) => requireAuthentication(req, next, services),
    (...args) => controller.deleteSession(...args),
  );
  return router;
};

export default {
  path: "/sessions",
  init,
};
