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
      ])
      .executeTakeFirst();
    return result;
  }
}
