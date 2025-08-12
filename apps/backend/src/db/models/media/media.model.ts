import { ControlledTransaction, Kysely, Transaction } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";
import { MediaParent } from "@src/db/types/media";

export type IMedia = DB["media"];

export class MediaModel extends BaseModel<"media", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "media", "id");
  }

  public async deleteManyForEntity(entityId: string, entityType: MediaParent, trx?: Transaction<DB>) {
    const client = trx ?? (await this.client.startTransaction().execute());

    const mediaMappings = await client
      .selectFrom("mediaMappings")
      .selectAll()
      .where("entityId", "=", entityId)
      .where("entityType", "=", entityType)
      .execute();

    await client
      .deleteFrom("mediaMappings")
      .where(
        "id",
        "in",
        mediaMappings.map((m) => m.id),
      )
      .execute();

    await client
      .deleteFrom("media")
      .where("parent", "=", entityType)
      .where(
        "id",
        "in",
        mediaMappings.map((m) => m.mediaId),
      )
      .execute();

    if (!trx) {
      await (client as ControlledTransaction<DB>).commit().execute();
    }
  }
}
