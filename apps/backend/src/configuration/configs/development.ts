import { IConfig } from "../types";

const config: Partial<IConfig> = {
  mailCatcher: {
    enabled: false,
    host: "localhost",
    port: 1025,
  },
};

export default config;
