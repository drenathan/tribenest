import Database from "@src/db/Database";
import { getRequestProperty } from "@src/utils/store";
import { EventEmitter } from "stream";
import ApiServices from "./_apis";

export type BaseServiceArgs = {
  database: Database;
  emitter: EventEmitter;
  apis: ApiServices;
};

export class BaseService {
  protected readonly models: Database["models"];
  protected readonly database: Database;
  public readonly emitter: EventEmitter;
  public readonly apis: ApiServices;

  constructor(args: BaseServiceArgs) {
    this.database = args.database;
    this.models = args.database.models;
    this.emitter = args.emitter;
    this.apis = args.apis;
  }
}
