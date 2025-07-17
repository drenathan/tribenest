import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { PublicComments } from "./controller";
import { publicAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new PublicComments(services, workers);

  router.use((req, _, next) => publicAuthentication(req, next, services));
  router.post("/", (...args) => controller.addComment(...args));
  router.delete("/:id", (...args) => controller.deleteComment(...args));
  router.get("/", (...args) => controller.getComments(...args));
  router.get("/count", (...args) => controller.getCommentCount(...args));
  return router;
};

export default {
  path: "/public/comments",
  init,
};
