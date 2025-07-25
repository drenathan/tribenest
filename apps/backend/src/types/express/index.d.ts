import { GetActiveMembershipResponse } from "@src/db/models/membership/membership.model";
import { DB, IProfileMembership } from "@src/db/types";
import { Locale } from "@src/types";
import { Selectable } from "kysely";
import { Socket } from "socket.io";
export {};
declare global {
  namespace Express {
    export interface Request {
      account?: Selectable<DB["accounts"]>;
      session?: Selectable<DB["sessions"]>;
      membership?: GetActiveMembershipResponse;
      resource?: any;
    }
  }
}

// Extend the interface
declare module "socket.io" {
  interface Socket {
    accountId: string;
    coupleId: string;
    locale: Locale;
  }
}
