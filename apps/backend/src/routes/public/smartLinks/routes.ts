import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { PublicSmartLinks } from "./controller";
import { publicAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new PublicSmartLinks(services, workers);

  router.use((req, _, next) => publicAuthentication(req, next, services));
  router.get("/", (...args) => controller.getOne(...args));
  return router;
};

export default {
  path: "/public/smart-links",
  init,
};
