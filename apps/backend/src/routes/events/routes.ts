import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { EventsController } from "./controller";
import { requireAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new EventsController(services, workers);
  router.use((req, _, next) => requireAuthentication(req, next, services));

  router.get("/", (...args) => controller.getEvents(...args));
  router.post("/", (...args) => controller.createEvent(...args));
  router.put("/", (...args) => controller.updateEvent(...args));
  router.get("/:id", (...args) => controller.getEvent(...args));
  router.post("/:id/archive", (...args) => controller.archiveEvent(...args));
  router.post("/:id/unarchive", (...args) => controller.unarchiveEvent(...args));

  // Tickets
  router.get("/:id/tickets", (...args) => controller.getTickets(...args));
  router.post("/:id/tickets", (...args) => controller.createTicket(...args));
  router.put("/:id/tickets/:ticketId", (...args) => controller.updateTicket(...args));
  router.post("/:id/tickets/:ticketId/archive", (...args) => controller.archiveTicket(...args));
  router.post("/:id/tickets/:ticketId/unarchive", (...args) => controller.unarchiveTicket(...args));
  router.post("/:id/tickets/reorder", (...args) => controller.reorderTickets(...args));

  return router;
};

export default {
  path: "/events",
  init,
};
