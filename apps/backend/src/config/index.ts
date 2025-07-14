import dotenv from "dotenv";
import path from "path";
dotenv.config({ path: path.join(__dirname, "../../.env") });

process.env["NODE_CONFIG_DIR"] = path.join(__dirname, "./configs");
import config from "config";

import { IConfig } from "./types";

export const getConfig = <Key extends keyof IConfig>(key: Key): IConfig[Key] => {
  return config.get(key) as IConfig[Key];
};
