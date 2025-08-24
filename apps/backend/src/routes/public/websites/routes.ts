import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { PublicWebsiteController } from "./controller";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new PublicWebsiteController(services, workers);
  router.get("/", (...args) => controller.getWebsite(...args));
  router.post("/contact", (...args) => controller.contact(...args));
  return router;
};

export default {
  path: "/public/websites",
  init,
};
