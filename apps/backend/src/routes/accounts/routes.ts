import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { AccountsController } from "./controller";
import { requireAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new AccountsController(services, workers);
  router.post("/", (...args) => controller.createAccount(...args));
  router.get(
    "/me",
    (req, _, next) => requireAuthentication(req, next, services),
    (...args) => controller.getMe(...args),
  );

  router.get(
    "/authorizations",
    (req, _, next) => requireAuthentication(req, next, services),
    (...args) => controller.getAuthorizations(...args),
  );

  return router;
};

export default {
  path: "/accounts",
  init,
};
