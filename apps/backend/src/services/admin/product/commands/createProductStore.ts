import { CreateExternalStoreInput } from "@src/routes/product/schema";
import { ProductService } from "..";
import { EncryptionService } from "@src/utils/encryption";
import { ValidationError } from "@src/utils/app_error";

export async function createProductStore(this: ProductService, input: CreateExternalStoreInput) {
  const storeApi = await this.apis.getExternalStore(input.provider, input.accessToken);
  console.log("storeApi", input.provider, input.accessToken);
  const storeDetails = await storeApi.getStoreDetails();

  const existingStore = await this.database.models.ProductStore.findOne({
    externalId: storeDetails.externalId,
    provider: input.provider,
  });

  if (existingStore) {
    throw new ValidationError("Store already exists");
  }

  const encryptedData = EncryptionService.encryptObject({ accessToken: input.accessToken }, ["accessToken"]);

  const store = await this.database.models.ProductStore.insertOne({
    provider: input.provider,
    name: storeDetails.name,
    accessToken: encryptedData.accessToken,
    profileId: input.profileId,
    externalId: storeDetails.externalId,
  });

  return store;
}
