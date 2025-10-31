import { z } from "zod";
import { paginationSchema } from "../schema";

export const getStreamTemplatesSchema = z.object({
  query: z.object({
    profileId: z.string().uuid(),
    ...paginationSchema.shape,
  }),
});

export const getStreamChannelsSchema = z.object({
  query: z.object({
    profileId: z.string().uuid(),
    ...paginationSchema.shape,
  }),
});

export type GetStreamChannelsInput = z.infer<typeof getStreamChannelsSchema>["query"];

export const createStreamTemplateSchema = z.object({
  body: z.object({
    profileId: z.string().uuid(),
    title: z.string(),
    description: z.string().optional(),
    config: z.record(z.string(), z.any()),
    scenes: z.array(z.record(z.string(), z.any())),
  }),
});

export const updateStreamTemplateSchema = z.object({
  body: z.object({
    id: z.string().uuid(),
    title: z.string(),
    description: z.string().optional(),
    config: z.record(z.string(), z.any()),
    scenes: z.array(z.record(z.string(), z.any())),
  }),
});

export type UpdateStreamTemplateInput = z.infer<typeof updateStreamTemplateSchema>["body"];

export type GetStreamTemplatesInput = z.infer<typeof getStreamTemplatesSchema>["query"];
export type CreateStreamTemplateInput = z.infer<typeof createStreamTemplateSchema>["body"];

export const getYoutubeOauthTokenSchema = z.object({
  query: z.object({
    code: z.string(),
    profileId: z.string(),
  }),
});

export const createYoutubeOauthUrlSchema = z.object({
  query: z.object({
    profileId: z.string().uuid(),
  }),
});

export const updateTemplateChannelsSchema = z.object({
  body: z.object({
    templateId: z.string().uuid(),
    channelIds: z.array(z.string().uuid()),
    profileId: z.string().uuid(),
  }),
});

export const createRoomSchema = z.object({
  body: z.object({
    profileId: z.string().uuid(),
    username: z.string().min(1, "Username is required"),
    userTitle: z.string().optional(),
  }),
});

export const stopEgressSchema = z.object({
  body: z.object({
    profileId: z.string().uuid(),
    broadcastId: z.string().uuid(),
  }),
});

export const getCommentsSchema = z.object({
  query: z.object({
    cursor: z.string().optional(),
    profileId: z.string().uuid(),
  }),
});

export const startEgressSchema = z.object({
  body: z.object({
    profileId: z.string().uuid(),
    eventId: z.string().uuid().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    thumbnailUrl: z.string().optional(),
  }),
});

export type StartEgressInput = z.infer<typeof startEgressSchema>["body"];

export const createCustomRtmpChannelSchema = z.object({
  body: z.object({
    profileId: z.string().uuid(),
    ingestUrl: z.string().url("Invalid URL"),
    title: z.string().min(1, "Title is required"),
  }),
});

export const updateBroadcastSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    thumbnailUrl: z.string().optional(),
  }),
});

export type UpdateBroadcastInput = z.infer<typeof updateBroadcastSchema>["body"];

export type CreateCustomRtmpChannelInput = z.infer<typeof createCustomRtmpChannelSchema>["body"];

export type GetCommentsInput = z.infer<typeof getCommentsSchema>["query"];
export type StopEgressInput = z.infer<typeof stopEgressSchema>["body"];

export type CreateRoomInput = z.infer<typeof createRoomSchema>["body"];

export type UpdateTemplateChannelsInput = z.infer<typeof updateTemplateChannelsSchema>["body"];

export type CreateYoutubeOauthUrlInput = z.infer<typeof createYoutubeOauthUrlSchema>["query"];

export type GetYoutubeOauthTokenInput = z.infer<typeof getYoutubeOauthTokenSchema>["query"];
