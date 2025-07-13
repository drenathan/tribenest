import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(__dirname, "../../.env") });
import { IConfig } from "./types";

const environmentMap = {
  local: "local",
  development: "local",
  production: "prod",
  test: "test",
  e2e: "e2e",
};
let config = {} as IConfig;

const configPath = path.join(
  __dirname,
  `./config.${environmentMap[process.env.NODE_ENV as keyof typeof environmentMap] || "local"}`
);

config = require(configPath).default;

export const getConfig = <Key extends keyof IConfig>(key: Key): IConfig[Key] => {
  return config[key] as IConfig[typeof key];
};
