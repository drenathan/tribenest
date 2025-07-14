import {
  DATABASE_PORT,
  DATABASE_HOST,
  DATABASE_NAME,
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  SES_ACCESS_KEY_ID,
  SES_SECRET_ACCESS_KEY,
  DATABASE_USER,
  DATABASE_PASSWORD,
  R2_BUCKET_NAME,
  R2_URL,
  R2_BUCKET_URL,
} from "../secrets";
import { IConfig } from "../types";

const config: Partial<IConfig> = {
  mailCatcher: {
    enabled: true,
    host: "mailcatcher",
    port: 1025,
  },
};

export default config;
