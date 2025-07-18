import { BadRequestError } from "@src/utils/app_error";
import { BaseService, BaseServiceArgs } from "../baseService";
import { FORBIDDEN_SUBDOMAINS } from "./contants";
import { CreateProfileInput, GetMediaInput, UploadMediaInput } from "@src/routes/profiles/schema";
import { safeStringify } from "@src/utils/json";
import { MediaParent } from "@src/db/types/media";
import { ProfilePaymentService } from "./profilePaymentService";

export class ProfileService extends BaseService {
  public payment: ProfilePaymentService;
  constructor(args: BaseServiceArgs) {
    super(args);
    this.payment = new ProfilePaymentService(args);
  }
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
    const emailClient = await this.apis.getEmailClient(profileId);

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
    const s3Client = await this.apis.getS3Client(profileId);

    await s3Client.testConnection();

    return { success: true, message: "R2 configuration is valid" };
  }

  /**
   * Test payment configuration
   */
  public async testPaymentConfiguration(profileId: string) {
    const paymentProvider = await this.apis.getPaymentProvider(profileId);
    await paymentProvider.testConnection();

    return { success: true, message: "Payment configuration is valid" };
  }
}
