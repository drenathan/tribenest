import {
  Kysely,
  NoResultError,
  type LogEvent,
  type Dialect,
  PostgresDialect,
  CamelCasePluginOptions,
  UnknownRow,
  CamelCasePlugin,
} from "kysely";
import { Pool } from "pg";
import { getConfig } from "@src/config";
import { bootstrapModels } from "./models";
import { DB } from "./types";
import isPlainObject from "lodash/isPlainObject";

export type DatabaseConfig<DB> = {
  isolated?: boolean;
  log?: (event: LogEvent) => void;
  debug?: boolean;
};

export default class Database {
  private dialect: Dialect;
  public client: Kysely<DB>;
  readonly log;
  readonly debug;
  public models: ReturnType<typeof bootstrapModels>;

  constructor(config: DatabaseConfig<DB> = {}) {
    const { log, debug = false } = config;
    const dbConfig = getConfig("postgres");

    this.log = log;
    this.debug = debug;

    this.dialect = new PostgresDialect({
      pool: new Pool(dbConfig),
    });

    this.client = new Kysely<DB>({
      dialect: this.dialect,
      plugins: [
        new MyCamelCasePlugin({
          excludeColumns: ["content", "theme_settings", "permissions", "user_agent", "membership_tiers"],
        }),
      ],
      log: (event) => {
        if (this.debug) {
          if (event.level === "query") {
            console.log(event?.query?.sql);
            console.log(event?.query?.parameters);
          }
        }

        this.log?.(event);
      },
    });
    this.models = bootstrapModels(this.client);
  }

  public async destroy() {
    await this.client.destroy();
  }
}

export class MyCamelCasePlugin extends CamelCasePlugin {
  private _excludedColumns: string[];

  constructor({ excludeColumns = [], ...opt }: CamelCasePluginOptions & { excludeColumns?: string[] } = {}) {
    super(opt);
    this._excludedColumns = excludeColumns;
  }

  protected mapRow(row: UnknownRow): UnknownRow {
    return Object.keys(row).reduce((obj: Record<string, any>, key) => {
      let value = row[key];
      if (this._excludedColumns.includes(key)) {
        obj[key] = value;
      } else if (Array.isArray(value)) {
        value = value.map((it) => (this.canMap(it, this.opt) ? this.mapRow(it) : it));
      } else if (this.canMap(value, this.opt)) {
        value = this.mapRow(value as UnknownRow);
      }
      obj[this.camelCase(key)] = value;
      return obj;
    }, {});
  }

  private canMap(obj: any, opt: any) {
    return isPlainObject(obj) && !opt?.maintainNestedObjectKeys;
  }
}
