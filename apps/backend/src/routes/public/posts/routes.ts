import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { PublicPosts } from "./controller";
import { publicAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new PublicPosts(services, workers);

  router.use((req, _, next) => publicAuthentication(req, next, services));
  router.get("/", (...args) => controller.getPosts(...args));
  return router;
};

export default {
  path: "/public/posts",
  init,
};
