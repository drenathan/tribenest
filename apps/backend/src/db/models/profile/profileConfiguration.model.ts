import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";
import { EncryptionService } from "@src/utils/encryption";
import { UpdateProfileConfigurationInput } from "@src/routes/profiles/schema";

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
   * Update profile configuration with encrypted sensitive fields
   */
  public async updateProfileConfiguration(profileId: string, data: UpdateProfileConfigurationInput) {
    // Encrypt sensitive fields before saving
    const encryptedData = EncryptionService.encryptObject({ ...data.email, ...data.r2, ...data.payment }, [
      "smtpPassword",
      "r2SecretAccessKey",
      "paymentProviderPrivateKey",
      "paymentProviderPublicKey",
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

    return this.client
      .updateTable("profileConfigurations")
      .set(encryptedData)
      .where("profileId", "=", profileId)
      .returningAll()
      .executeTakeFirst();
  }
}
