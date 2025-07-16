import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export class ProfileConfigurationModel extends BaseModel<"profileConfigurations", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "profileConfigurations", "id");
  }
}
