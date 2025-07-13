import { R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, SES_ACCESS_KEY_ID, SES_SECRET_ACCESS_KEY } from "./secrets";
import { IConfig } from "./types";

const config: IConfig = {
  worker: {
    normalQueueLockDuration: 1000 * 60 * 10, // 10 minutes
    scheduledQueueLockDuration: 1000 * 60 * 10, // 10 minutes
  },
  ses: {
    accessKeyId: SES_ACCESS_KEY_ID,
    secretAccessKey: SES_SECRET_ACCESS_KEY,
    region: "eu-north-1",
    from: "TribeNest <hello@tribenest.co",
  },
  mailCatcher: {
    enabled: false,
    host: "mailcatcher",
    port: 1025,
  },
  postgres: {
    host: "localhost",
    port: 5432,
    user: "tribe",
    password: "tribe",
    database: "tribe-test",
    max: 10,
  },

  s3: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
    region: "auto",
    bucketName: "assets-dev",
    url: "https://e45a0756fae5f44b4bfab4e3c46c5aab.eu.r2.cloudflarestorage.com",
    presignedUrlExpiration: 60 * 60 * 30, // 30 minutes
    bucketUrl: "https://assets-dev.coumo.com",
  },
};

export default config;
