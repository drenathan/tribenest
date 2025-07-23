import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { EmailsController } from "./controller";
import { requireAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new EmailsController(services, workers);
  router.use((req, _, next) => requireAuthentication(req, next, services));

  // Email Lists
  router.get("/lists", (...args) => controller.getEmailLists(...args));
  router.get("/lists/:id", (...args) => controller.getEmailList(...args));
  router.post("/lists", (...args) => controller.createEmailList(...args));
  router.put("/lists/:id", (...args) => controller.updateEmailList(...args));

  // Email Templates
  router.get("/templates", (...args) => controller.getEmailTemplates(...args));
  router.get("/templates/:id", (...args) => controller.getEmailTemplate(...args));
  router.post("/templates", (...args) => controller.createEmailTemplate(...args));
  router.put("/templates/:id", (...args) => controller.updateEmailTemplate(...args));

  // Emails
  router.get("/", (...args) => controller.getEmails(...args));
  router.get("/:id", (...args) => controller.getEmail(...args));
  router.post("/", (...args) => controller.createEmail(...args));

  return router;
};

export default {
  path: "/emails",
  init,
};
