import { Database } from "@src/db";
import { AccountService } from "./account";
import { SessionService } from "./session";
import EventEmitter from "events";
import { ProfileService } from "./profile";
import { MembershipService } from "./membership";
import { ProfileAuthorizationService } from "./profileAuthorization";
import { WebsiteService } from "./website";
import ApiServices from "./_apis";
import { AdminService } from "./admin";
import { PublicService } from "./public";

export class Services {
  public readonly account: AccountService;
  public readonly admin: AdminService;
  public readonly profile: ProfileService;
  public readonly profileAuthorization: ProfileAuthorizationService;
  public readonly session: SessionService;
  public readonly membership: MembershipService;
  public readonly website: WebsiteService;
  public readonly emitter: EventEmitter;
  public readonly apis: ApiServices;
  public readonly public: PublicService;

  constructor(database: Database) {
    const emitter = new EventEmitter();
    this.apis = new ApiServices(database);

    const args = { database, emitter, apis: this.apis };
    this.emitter = emitter;
    this.admin = new AdminService(args);
    this.account = new AccountService(args);
    this.membership = new MembershipService(args);
    this.profile = new ProfileService(args);
    this.profileAuthorization = new ProfileAuthorizationService(args);
    this.public = new PublicService(args);
    this.session = new SessionService(args);
    this.website = new WebsiteService(args);
  }
}
