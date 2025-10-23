import { Kysely } from "kysely";
import BaseModel from "../baseModel";
import { DB } from "../../types";

export type IStreamTemplateChannel = DB["streamTemplateChannels"];

export class StreamTemplateChannelModel extends BaseModel<"streamTemplateChannels", "id"> {
  constructor(client: Kysely<DB>) {
    super(client, "streamTemplateChannels", "id");
  }

  public async findByTemplateId(templateId: string) {
    return this.client
      .selectFrom("streamTemplateChannels as stc")
      .innerJoin("streamChannels as sc", "stc.streamChannelId", "sc.id")
      .where("stc.streamTemplateId", "=", templateId)
      .selectAll("sc")

      .execute();
  }
}
