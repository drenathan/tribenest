import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { PostsController } from "./controller";
import { requireAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new PostsController(services, workers);
  router.use((req, _, next) => requireAuthentication(req, next, services));

  router.get("/", (...args) => controller.getPosts(...args));
  router.post("/", (...args) => controller.createPost(...args));
  router.get("/:id", (...args) => controller.getPost(...args));
  router.put("/:id", (...args) => controller.updatePost(...args));
  return router;
};

export default {
  path: "/posts",
  init,
};
