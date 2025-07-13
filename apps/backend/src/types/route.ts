import { Services } from "@src/services";
import { Workers } from "@src/workers";
import { Router } from "express";

export type InitRouteArgs = {
  services: Services;
  workers: Workers;
};
export type InitRouteFunction = (args: InitRouteArgs) => Router;

export enum AdminResource {
  all = "all",
  activityOfTheDay = "activityOfTheDay",
  articles = "articles",
  games = "games",
  affiliates = "affiliates",
}

export type Action = "create" | "read" | "update" | "delete" | "manage";

export interface Capability {
  action: Action;
  subject: AdminResource;
}
