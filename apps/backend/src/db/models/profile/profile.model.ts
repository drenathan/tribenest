import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export type IProfile = DB["profiles"];

export class ProfileModel extends BaseModel<"profiles", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "profiles", "id");
  }

  public async getProfile(profileId: string) {
    const result = await this.client
      .selectFrom("profiles as p")
      .where("p.id", "=", profileId)
      .leftJoin("profileConfigurations as pc", "p.id", "pc.profileId")
      .selectAll(["p"])
      .select((eb) => [
        eb.ref("pc.paymentProviderName").as("paymentProviderName"),
        eb.ref("pc.paymentProviderPublicKey").as("paymentProviderPublicKey"),
        eb.ref("pc.paymentProviderPrivateKey").as("paymentProviderPrivateKey"),
        eb.ref("pc.smtpUsername").as("smtpUsername"),
        eb.ref("pc.smtpPassword").as("smtpPassword"),
        eb.ref("pc.smtpHost").as("smtpHost"),
        eb.ref("pc.smtpPort").as("smtpPort"),
        eb.ref("pc.smtpFrom").as("smtpFrom"),
        eb.ref("pc.r2BucketName").as("r2BucketName"),
        eb.ref("pc.r2AccessKeyId").as("r2AccessKeyId"),
        eb.ref("pc.r2SecretAccessKey").as("r2SecretAccessKey"),
        eb.ref("pc.r2Endpoint").as("r2Endpoint"),
        eb.ref("pc.r2Region").as("r2Region"),
        eb.ref("pc.r2BucketUrl").as("r2BucketUrl"),
      ])
      .executeTakeFirst();
    return result;
  }
}
