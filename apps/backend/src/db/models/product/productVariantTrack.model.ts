import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export type IProductVariantTrack = DB["productVariantTracks"];

export class ProductVariantTrackModel extends BaseModel<"productVariantTracks", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "productVariantTracks", "id");
  }
}
