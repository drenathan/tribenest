import { Insertable, Kysely, Updateable } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";
import { EncryptionService } from "@src/utils/encryption";
import { UpdateProfileConfigurationInput } from "@src/routes/profiles/schema";
import { maskConfiguration } from "@src/utils/mask";

export type IProfileConfiguration = DB["profileConfigurations"];

export class ProfileConfigurationModel extends BaseModel<"profileConfigurations", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "profileConfigurations", "id");
  }

  /**
   * Get profile configuration with decrypted sensitive fields
   */
  public async getProfileConfiguration(profileId: string) {
    const config = await this.client
      .selectFrom("profileConfigurations")
      .where("profileId", "=", profileId)
      .selectAll()
      .executeTakeFirst();

    if (!config) return null;

    // Decrypt sensitive fields
    return EncryptionService.decryptObject(config, [
      "smtpPassword",
      "r2SecretAccessKey",
      "paymentProviderPrivateKey",
      "paymentProviderPublicKey",
      "paymentProviderWebhookSecret",
      "smtpFrom",
      "smtpUsername",
      "smtpHost",
      "smtpPort",
      "r2BucketName",
      "r2AccessKeyId",
      "r2Endpoint",
      "r2Region",
      "r2BucketUrl",
    ]);
  }

  /**
   * Get profile configuration with masked sensitive fields for UI display
   */
  public async getProfileConfigurationMasked(profileId: string) {
    const config = await this.getProfileConfiguration(profileId);
    if (!config) return null;

    // Return masked version for UI display
    return maskConfiguration(config);
  }

  /**
   * Update profile configuration with encrypted sensitive fields
   */
  public async updateProfileConfiguration(profileId: string, data: UpdateProfileConfigurationInput) {
    // Get current configuration to compare with new data
    const currentConfig = await this.getProfileConfiguration(profileId);
    type UpdateProfileConfigurationData = Updateable<IProfileConfiguration>;

    // Prepare update data, only including fields that have changed
    const updateData: Partial<UpdateProfileConfigurationData> = {};

    // Handle email configuration
    if (data.email) {
      Object.keys(data.email).forEach((key) => {
        const newValue = (data.email as any)[key];
        const currentValue = (currentConfig as any)?.[key];

        // Only update if the value has changed and is not a masked value
        if (newValue !== undefined && newValue !== currentValue && !this.isMaskedValue(newValue)) {
          updateData[key as keyof UpdateProfileConfigurationData] = newValue;
        }
      });
    }

    // Handle R2 configuration
    if (data.r2) {
      Object.keys(data.r2).forEach((key) => {
        const newValue = (data.r2 as any)[key];
        const currentValue = (currentConfig as any)?.[key];

        // Only update if the value has changed and is not a masked value
        if (newValue !== undefined && newValue !== currentValue && !this.isMaskedValue(newValue)) {
          updateData[key as keyof UpdateProfileConfigurationData] = newValue;
        }
      });
    }

    // Handle payment configuration
    if (data.payment) {
      Object.keys(data.payment).forEach((key) => {
        const newValue = (data.payment as any)[key];
        const currentValue = (currentConfig as any)?.[key];

        // Only update if the value has changed and is not a masked value
        if (newValue !== undefined && newValue !== currentValue && !this.isMaskedValue(newValue)) {
          updateData[key as keyof UpdateProfileConfigurationData] = newValue;
        }
      });
    }

    if (data.pwa) {
      updateData.pwaConfig = JSON.stringify(data.pwa);
    }
    if (data.address) {
      updateData.address = JSON.stringify(data.address);
    }

    // If no changes, return current configuration
    if (Object.keys(updateData).length === 0) {
      return currentConfig;
    }

    // Encrypt sensitive fields before saving
    const encryptedData = EncryptionService.encryptObject(updateData, [
      "smtpPassword",
      "paymentProviderPrivateKey",
      "paymentProviderPublicKey",
      "paymentProviderWebhookSecret",
      "smtpFrom",
      "smtpUsername",
      "smtpHost",
      "smtpPort",
      "r2SecretAccessKey",
      "r2AccessKeyId",
      "r2BucketName",
      "r2Endpoint",
      "r2Region",
      "r2BucketUrl",
    ]);

    await this.updateOne({ profileId }, encryptedData);

    return true;
  }

  /**
   * Check if a value is a masked value (contains asterisks)
   */
  private isMaskedValue(value: string | null | undefined): boolean {
    if (!value) return false;
    return value.includes("*");
  }
}
