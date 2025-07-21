import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export type IProfileOnboardingStep = DB["profileOnboardingSteps"];

export class ProfileOnboardingStepModel extends BaseModel<"profileOnboardingSteps", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "profileOnboardingSteps", "id");
  }
}
