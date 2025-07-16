import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { PublicAccountsController } from "./controller";
import { publicAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new PublicAccountsController(services, workers);
  const throwOnError = true;
  router.post("/", (...args) => controller.createAccount(...args));
  router.get(
    "/me",
    (req, _, next) => publicAuthentication(req, next, services, throwOnError),
    (...args) => controller.getMe(...args),
  );
  return router;
};

export default {
  path: "/public/accounts",
  init,
};
