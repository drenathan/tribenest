import { IConfig } from "../types";

const config: Partial<IConfig> = {
  mailCatcher: {
    enabled: false,
    host: "mailcatcher",
    port: 1025,
  },
};

export default config;
