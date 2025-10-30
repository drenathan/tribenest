import z from "zod";

export const leaveBroadcastSchema = z.object({
  body: z.object({
    sessionId: z.string().optional(),
  }),
});

export type LeaveBroadcastInput = z.infer<typeof leaveBroadcastSchema>["body"];

export const validateSessionSchema = z.object({
  body: z.object({
    sessionId: z.string(),
  }),
});

export type ValidateSessionInput = z.infer<typeof validateSessionSchema>["body"];
