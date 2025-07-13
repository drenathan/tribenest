import z from "zod";

export const createPresignedUrlSchema = z.object({
  body: z.object({
    fileName: z.string({ required_error: "File name is required" }),
  }),
});

export type CreatePresignedUrlInput = z.infer<typeof createPresignedUrlSchema>["body"];
