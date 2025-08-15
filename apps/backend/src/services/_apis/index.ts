import { Database } from "@src/db";
import { EmailClient } from "@src/workers/emails/EmailClient";
import S3Service from "./s3";
import { PaymentProviderFactory } from "../paymentProvider/PaymentProviderFactory";
import { PaymentProviderName } from "../paymentProvider/PaymentProvider";
import { BadRequestError, ValidationError } from "@src/utils/app_error";
import { getConfig } from "@src/configuration";
import { ExternalStoreFactory } from "./store/ExternalStoreFactory";
import { ExternalStoreProvider } from "./store/ExternalStore";
import { EncryptionService } from "@src/utils/encryption";

export default class ApiServices {
  public readonly encryption: EncryptionService;
  constructor(private database: Database) {
    this.encryption = new EncryptionService();
  }

  public async getEmailClient(profileId: string) {
    const config = await this.database.models.ProfileConfiguration.getProfileConfiguration(profileId);
    if (
      !config ||
      !config.smtpHost ||
      !config.smtpUsername ||
      !config.smtpPassword ||
      !config.smtpPort ||
      !config.smtpFrom
    ) {
      throw new BadRequestError("Cannot create email client as profile configuration is not complete");
    }

    return new EmailClient({
      host: config.smtpHost,
      port: parseInt(config.smtpPort),
      from: config.smtpFrom,
      auth: {
        user: config.smtpUsername,
        pass: config.smtpPassword,
      },
    });
  }

  public async getS3Client(profileId: string) {
    const config = await this.database.models.ProfileConfiguration.getProfileConfiguration(profileId);
    if (!config) {
      throw new ValidationError("Profile configuration not found");
    }

    if (config.storageType === "local") {
      const minioConfig = getConfig("minio");
      return new S3Service(minioConfig);
    }

    if (
      !config.r2BucketName ||
      !config.r2AccessKeyId ||
      !config.r2SecretAccessKey ||
      !config.r2Endpoint ||
      !config.r2Region ||
      !config.r2BucketUrl
    ) {
      throw new BadRequestError("Cannot create s3 client as profile configuration is not complete");
    }

    return new S3Service({
      accessKeyId: config.r2AccessKeyId,
      secretAccessKey: config.r2SecretAccessKey,
      url: config.r2Endpoint,
      region: config.r2Region,
      bucketName: config.r2BucketName,
      bucketUrl: config.r2BucketUrl,
    });
  }

  public async getPaymentProvider(profileId: string) {
    const config = await this.database.models.ProfileConfiguration.getProfileConfiguration(profileId);
    if (
      !config ||
      !config.paymentProviderName ||
      !config.paymentProviderPrivateKey ||
      !config.paymentProviderPublicKey ||
      !config.paymentProviderWebhookSecret
    ) {
      throw new BadRequestError("Payment configuration not found");
    }

    return PaymentProviderFactory.create(config.paymentProviderName as PaymentProviderName, {
      apiKeys: {
        privateKey: config.paymentProviderPrivateKey,
        publicKey: config.paymentProviderPublicKey,
        webhookSecret: config.paymentProviderWebhookSecret,
      },
    });
  }

  public async getExternalStore(storeProvider: ExternalStoreProvider, accessToken: string) {
    return ExternalStoreFactory.create(storeProvider, {
      accessToken,
    });
  }
}
