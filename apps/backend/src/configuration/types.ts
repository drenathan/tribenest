export interface IConfig {
  ses: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    from: string;
  };
  postgres: {
    host: string;
    port: number;
    user: string;
    password: string;
    database: string;
    ssl?: { rejectUnauthorized: boolean };
    max?: number;
  };
  mailCatcher: {
    enabled: boolean;
    host: string;
    port: number;
  };

  s3: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucketName: string;
    url: string;
    presignedUrlExpiration: number;
    bucketUrl: string;
  };
  smtp: {
    host: string;
    port: number;
    auth: {
      user: string;
      pass: string;
    };
    from: string;
  };

  worker: {
    normalQueueLockDuration: number;
    scheduledQueueLockDuration: number;
  };

  minio: {
    accessKeyId: string;
    secretAccessKey: string;
    region: string;
    bucketName: string;
    url: string;
    presignedUrlExpiration: number;
    bucketUrl: string;
  };
}
