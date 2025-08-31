import z from "zod";

const trackEventSchema = z.object({
  body: z.object({
    path: z.string().min(1, "Path is required"),
    eventType: z.string().min(1, "Event type is required"),
    eventData: z.record(z.any()),
  }),
});

export type TrackEventInput = z.infer<typeof trackEventSchema>["body"];

export { trackEventSchema };
