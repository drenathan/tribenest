import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";
import { EncryptionService } from "@src/utils/encryption";

export class ProfileAuthorizationModel extends BaseModel<"profileAuthorizations", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "profileAuthorizations", "id");
  }

  public async getProfileAuthorizations(accountId: string) {
    const authorizations = await this.client
      .selectFrom("profileAuthorizations as pa")
      .where("pa.accountId", "=", accountId)
      .selectAll()
      .select((eb) => [
        this.jsonObjectFrom(
          eb
            .selectFrom("profiles as p")
            .fullJoin("profileConfigurations as pc", "pc.profileId", "p.id")
            .select(["p.name", "p.id", "pc.paymentProviderPublicKey"])
            .whereRef("p.id", "=", "pa.profileId"),
        ).as("profile"),
      ])
      .execute();

    return authorizations.map((authorization) => ({
      ...authorization,
      profile: EncryptionService.decryptObject(authorization.profile!, ["paymentProviderPublicKey"]),
    }));
  }
}
