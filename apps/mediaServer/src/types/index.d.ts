import { Socket } from "socket.io";

declare module "socket.io" {
  interface Socket extends Socket {
    destinations: string[];
    profileId: string;
  }
}
