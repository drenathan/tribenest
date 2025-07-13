import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export type IMediaMapping = DB["mediaMappings"];

export class MediaMappingModel extends BaseModel<"mediaMappings", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "mediaMappings", "id");
  }
}
