import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

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
          eb.selectFrom("profiles as p").select(["p.name", "p.id"]).whereRef("p.id", "=", "pa.profileId"),
        ).as("profile"),
      ])
      .execute();
    return authorizations;
  }
}
