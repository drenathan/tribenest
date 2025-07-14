import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { PublicAccountsController } from "./controller";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new PublicAccountsController(services, workers);
  router.post("/", (...args) => controller.createAccount(...args));
  return router;
};

export default {
  path: "/public/accounts",
  init,
};
