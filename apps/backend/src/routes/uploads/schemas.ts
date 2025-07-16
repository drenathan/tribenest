import z from "zod";

export const createPresignedUrlSchema = z.object({
  body: z.object({
    fileName: z.string({ required_error: "File name is required" }),
    profileId: z.string({ required_error: "Profile ID is required" }).uuid("Invalid profile ID"),
  }),
});

export type CreatePresignedUrlInput = z.infer<typeof createPresignedUrlSchema>["body"];
