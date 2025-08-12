import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { ProductsController } from "./controller";
import { requireAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new ProductsController(services, workers);
  router.use((req, _, next) => requireAuthentication(req, next, services));

  router.get("/", (...args) => controller.getProducts(...args));
  router.post("/", (...args) => controller.createProduct(...args));
  router.post("/stores", (...args) => controller.createExternalStore(...args));
  router.get("/stores", (...args) => controller.getStores(...args));
  router.get("/:id", (...args) => controller.getProduct(...args));
  router.put("/:id", (...args) => controller.updateProduct(...args));
  router.delete("/:id", (...args) => controller.archiveProduct(...args));
  router.post("/:id/unarchive", (...args) => controller.unarchiveProduct(...args));
  return router;
};

export default {
  path: "/products",
  init,
};
