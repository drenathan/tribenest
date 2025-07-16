import { BadRequestError } from "@src/utils/app_error";
import { BaseService } from "../baseService";
import { FORBIDDEN_SUBDOMAINS } from "./contants";
import { CreateProfileInput, GetMediaInput, UploadMediaInput } from "@src/routes/profiles/schema";
import { safeStringify } from "@src/utils/json";
import { MediaParent } from "@src/db/types/media";
import { EmailClient } from "@src/workers/emails/EmailClient";
import { EncryptionService } from "@src/utils/encryption";

export class ProfileService extends BaseService {
  public async validateSubdomain(name: string) {
    if (FORBIDDEN_SUBDOMAINS.includes(name)) {
      return false;
    }
    const profile = await this.database.models.Profile.findOne({ name });
    if (profile) {
      return false;
    }
    return true;
  }

  public async createProfile({ name, subdomain }: CreateProfileInput, accountId: string) {
    const isValidName = await this.validateSubdomain(subdomain);
    if (!isValidName) {
      throw new BadRequestError("Invalid profile name");
    }
    const trx = await this.database.client.startTransaction().execute();

    try {
      const profile = await this.database.models.Profile.insertOne({ name, subdomain }, trx);
      const profileAuthorization = await this.database.models.ProfileAuthorization.insertOne(
        { profileId: profile.id, accountId, isOwner: true },
        trx,
      );
      await this.database.models.ProfileConfiguration.insertOne({ profileId: profile.id }, trx);
      await this.database.models.MembershipTier.insertOne(
        {
          name: "Free Membership",
          description: "Free membership",
          profileId: profile.id,
          priceMonthly: 0,
          priceYearly: 0,
          payWhatYouWant: false,
        },
        trx,
      );

      await trx.commit().execute();

      return { profile, profileAuthorization };
    } catch (error) {
      await trx.rollback().execute();
      throw error;
    }
  }

  public async uploadMedia(input: UploadMediaInput, profileId: string) {
    const { url, type, parent, name, size } = input;
    const media = await this.database.models.Media.insertOne({
      url,
      type,
      parent: parent as MediaParent,
      name,
      size,
      profileId,
    });
    return media;
  }

  public async getMedia(input: GetMediaInput, profileId: string) {
    const { parent, type } = input;
    const media = await this.database.models.Media.find({ profileId, parent: parent as MediaParent, type }, (qb) =>
      qb.orderBy("createdAt", "desc"),
    );
    console.log(safeStringify(media));
    return media;
  }

  public async getProfile(profileId: string) {
    const profile = await this.database.models.Profile.getProfile(profileId);
    return profile;
  }

  public async getEmailClient(profileId: string) {
    const profile = await this.database.models.Profile.getProfile(profileId);
    if (
      !profile ||
      !profile.smtpHost ||
      !profile.smtpUsername ||
      !profile.smtpPassword ||
      !profile.smtpPort ||
      !profile.smtpFrom
    ) {
      throw new Error("Cannot create email client as profile configuration is not complete");
    }

    const decryptedProfile = EncryptionService.decryptObject(
      {
        smtpPassword: profile.smtpPassword,
        smtpUsername: profile.smtpUsername,
        smtpHost: profile.smtpHost,
        smtpPort: profile.smtpPort,
        smtpFrom: profile.smtpFrom,
      },
      ["smtpPassword", "smtpUsername", "smtpHost", "smtpPort", "smtpFrom"],
    );

    return new EmailClient({
      host: decryptedProfile.smtpHost,
      port: parseInt(decryptedProfile.smtpPort),
      from: decryptedProfile.smtpFrom,
      auth: {
        user: decryptedProfile.smtpUsername,
        pass: decryptedProfile.smtpPassword,
      },
    });
  }

  /**
   * Get profile configuration with decrypted sensitive fields
   */
  public async getProfileConfiguration(profileId: string) {
    return this.database.models.ProfileConfiguration.getProfileConfiguration(profileId);
  }

  /**
   * Get profile configuration with masked sensitive fields for UI display
   */
  public async getProfileConfigurationMasked(profileId: string) {
    return this.database.models.ProfileConfiguration.getProfileConfigurationMasked(profileId);
  }

  /**
   * Update profile configuration with encrypted sensitive fields
   */
  public async updateProfileConfiguration(profileId: string, data: any) {
    return this.database.models.ProfileConfiguration.updateProfileConfiguration(profileId, data);
  }

  /**
   * Test email configuration
   */
  public async testEmailConfiguration(profileId: string, testEmail: string) {
    const config = await this.getProfileConfiguration(profileId);
    if (!config || !config.smtpHost || !config.smtpUsername || !config.smtpPassword) {
      throw new Error("Email configuration not found or incomplete");
    }

    const emailClient = new EmailClient({
      host: config.smtpHost,
      port: parseInt(config.smtpPort || "587"),
      from: config.smtpFrom || "test@example.com",
      auth: {
        user: config.smtpUsername,
        pass: config.smtpPassword,
      },
    });

    await emailClient.sendEmail({
      to: testEmail,
      subject: "Test Email from TribeNest",
      html: "<h1>Test Email</h1><p>This is a test email to verify your SMTP configuration.</p>",
    });

    return { success: true, message: "Test email sent successfully" };
  }

  /**
   * Test R2 configuration
   */
  public async testR2Configuration(profileId: string) {
    const config = await this.getProfileConfiguration(profileId);
    if (
      !config ||
      !config.r2BucketName ||
      !config.r2AccessKeyId ||
      !config.r2SecretAccessKey ||
      !config.r2Endpoint ||
      !config.r2Region
    ) {
      throw new Error("R2 configuration not found or incomplete");
    }

    // Test R2 connection by trying to list objects
    const { S3Client, ListObjectsV2Command } = await import("@aws-sdk/client-s3");

    const client = new S3Client({
      credentials: {
        accessKeyId: config.r2AccessKeyId,
        secretAccessKey: config.r2SecretAccessKey,
      },
      endpoint: config.r2Endpoint,
      region: config.r2Region,
      forcePathStyle: true,
    });

    const command = new ListObjectsV2Command({
      Bucket: config.r2BucketName,
      MaxKeys: 1,
    });

    await client.send(command);

    return { success: true, message: "R2 configuration is valid" };
  }

  /**
   * Test payment configuration
   */
  public async testPaymentConfiguration(profileId: string) {
    const config = await this.getProfileConfiguration(profileId);
    if (!config || !config.paymentProviderName) {
      throw new Error("Payment configuration not found");
    }

    // Test payment provider configuration
    if (config.paymentProviderName === "stripe") {
      const stripe = require("stripe")(config.paymentProviderPrivateKey);
      await stripe.paymentMethods.list({ limit: 1 });
    }

    return { success: true, message: "Payment configuration is valid" };
  }
}
