import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { PublicPosts } from "./controller";
import { publicAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new PublicPosts(services, workers);
  const throwOnUnauthenticated = true;
  router.get(
    "/",
    (req, _, next) => publicAuthentication(req, next, services),
    (...args) => controller.getPosts(...args),
  );
  router.get(
    "/saved",
    (req, _, next) => publicAuthentication(req, next, services, throwOnUnauthenticated),
    (...args) => controller.getSavedPosts(...args),
  );
  return router;
};

export default {
  path: "/public/posts",
  init,
};
