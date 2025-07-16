import { Database } from "@src/db";
import { EncryptionService } from "@src/utils/encryption";
import { EmailClient } from "@src/workers/emails/EmailClient";
import S3Service from "./s3";
import { PaymentProviderFactory } from "../paymentProvider/PaymentProviderFactory";
import { PaymentProviderName } from "../paymentProvider/PaymentProvider";

export default class ApiServices {
  constructor(private database: Database) {}

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
      throw new Error("Cannot create email client as profile configuration is not complete");
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
    if (
      !config ||
      !config.r2BucketName ||
      !config.r2AccessKeyId ||
      !config.r2SecretAccessKey ||
      !config.r2Endpoint ||
      !config.r2Region ||
      !config.r2BucketUrl
    ) {
      throw new Error("Cannot create s3 client as profile configuration is not complete");
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
      !config.paymentProviderPublicKey
    ) {
      throw new Error("Payment configuration not found");
    }

    return PaymentProviderFactory.create(config.paymentProviderName as PaymentProviderName, {
      apiKeys: {
        privateKey: config.paymentProviderPrivateKey,
        publicKey: config.paymentProviderPublicKey,
      },
    });
  }
}
