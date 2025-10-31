import { InitRouteFunction } from "@src/types";
import { Router } from "express";
import { StreamsController } from "./controller";
import { requireAuthentication } from "@src/middlewares";

const init: InitRouteFunction = ({ services, workers }) => {
  const router = Router();
  const controller = new StreamsController(services, workers);
  router.use((req, _, next) => requireAuthentication(req, next, services));

  // Templates
  router.get("/templates", (...args) => controller.getStreamTemplates(...args));
  router.post("/templates", (...args) => controller.createStreamTemplate(...args));
  router.get("/templates/:id", (...args) => controller.getStreamTemplate(...args));
  router.put("/templates/:id", (...args) => controller.updateStreamTemplate(...args));
  router.post("/templates/:id/rooms", (...args) => controller.createRoom(...args));

  // Channels
  router.get("/channels", (...args) => controller.getStreamChannels(...args));
  router.post("/channels/custom-rtmp", (...args) => controller.createCustomRtmpChannel(...args));

  // Template Channels
  router.put("/templates/:id/channels", (...args) => controller.updateTemplateChannels(...args));
  router.get("/templates/:id/channels", (...args) => controller.getTemplateChannels(...args));
  router.post("/templates/:id/go-live", (...args) => controller.goLive(...args));
  router.post("/templates/:id/start-egress", (...args) => controller.startEgress(...args));
  router.post("/templates/:id/stop-egress", (...args) => controller.stopEgress(...args));

  // OAuth
  router.get("/oauth/youtube/url", (...args) => controller.createYoutubeOauthUrl(...args));
  router.get("/oauth/youtube/token", (...args) => controller.getYoutubeOauthToken(...args));
  router.get("/oauth/twitch/url", (...args) => controller.createTwitchOauthUrl(...args));
  router.get("/oauth/twitch/token", (...args) => controller.getTwitchOauthToken(...args));

  // Broadcasts
  router.post("/broadcasts/cleanup", (...args) => controller.cleanupBroadcasts(...args));
  router.get("/broadcasts/:id/comments", (...args) => controller.getBroadcastComments(...args));
  router.put("/broadcasts/:id", (...args) => controller.updateBroadcast(...args));

  return router;
};

export default {
  path: "/streams",
  init,
};
