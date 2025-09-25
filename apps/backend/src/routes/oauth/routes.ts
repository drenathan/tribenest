import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { OauthController } from "./controller";
import { requireAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new OauthController(services, workers);
  router.use();
  router.get(
    "/youtube/url",
    (req, _, next) => requireAuthentication(req, next, services),
    (...args) => controller.createYoutubeOauthUrl(...args),
  );

  return router;
};

export default {
  path: "/oauth",
  init,
};
