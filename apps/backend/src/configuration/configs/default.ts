import {
  R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY,
  SES_ACCESS_KEY_ID,
  SES_SECRET_ACCESS_KEY,
  DATABASE_HOST,
  DATABASE_PORT,
  DATABASE_USER,
  DATABASE_PASSWORD,
  DATABASE_NAME,
  R2_BUCKET_URL,
  R2_URL,
  R2_BUCKET_NAME,
  SMTP_PASSWORD,
  SMTP_USER,
  SMTP_PORT,
  SMTP_HOST,
  SMTP_FROM,
} from "../secrets";
import { IConfig } from "../types";

const config: Partial<IConfig> = {
  smtp: {
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASSWORD,
    },
    from: SMTP_FROM,
  },
  worker: {
    normalQueueLockDuration: 1000 * 60 * 10, // 10 minutes
    scheduledQueueLockDuration: 1000 * 60 * 10, // 10 minutes
  },
  ses: {
    accessKeyId: SES_ACCESS_KEY_ID,
    secretAccessKey: SES_SECRET_ACCESS_KEY,
    region: "eu-north-1",
    from: "Coumo <hello@coumo.com>",
  },

  postgres: {
    host: DATABASE_HOST,
    port: Number(DATABASE_PORT),
    user: DATABASE_USER,
    password: DATABASE_PASSWORD,
    database: DATABASE_NAME,
    max: 10,
  },
  s3: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    region: "auto",
    bucketName: R2_BUCKET_NAME,
    url: R2_URL,
    presignedUrlExpiration: 60 * 60 * 30, // 30 minutes
    bucketUrl: R2_BUCKET_URL,
  },
};

export default config;
