import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { PublicProducts } from "./controller";
import { publicAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new PublicProducts(services, workers);
  router.use((req, _, next) => publicAuthentication(req, next, services));
  router.get("/featured", (...args) => controller.getFeaturedProducts(...args));
  router.get("/shipping-countries", (...args) => controller.getShippingCountries(...args));
  router.get("/", (...args) => controller.getProducts(...args));
  router.get("/:id", (...args) => controller.getProduct(...args));
  return router;
};

export default {
  path: "/public/products",
  init,
};
