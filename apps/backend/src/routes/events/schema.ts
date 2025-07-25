import { z } from "zod";
import { paginationSchema } from "../schema";

export const getEventsSchema = z.object({
  query: z.object({
    profileId: z.string().uuid(),
    ...paginationSchema.shape,
  }),
});

export type GetEventsInput = z.infer<typeof getEventsSchema>["query"];

export const createEventSchema = z.object({
  body: z.object({
    profileId: z.string().uuid(),
    dateTime: z.string().datetime(),
    address: z
      .object({
        name: z.string().min(1, "Name is required"),
        street: z.string().min(1, "Street is required"),
        city: z.string().min(1, "City is required"),
        country: z.string().min(1, "Country is required"),
        zipCode: z.string().optional(),
      })
      .refine(
        (data) => {
          if (data.country.toUpperCase() === "US" && !data.zipCode) {
            return false;
          }
          return true;
        },
        {
          message: "Zip code is required for USA addresses",
          path: ["zipCode"],
        },
      ),
    title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
    description: z.string().optional(),
    actionText: z.string().min(1, "Action text is required").max(100, "Action text must be less than 100 characters"),
    actionLink: z.string().url("Action link must be a valid URL"),
  }),
});

export type CreateEventInput = z.infer<typeof createEventSchema>["body"];

export const updateEventSchema = z.object({
  body: z.object({
    id: z.string().uuid(),
    profileId: z.string().uuid(),
    dateTime: z.string().datetime(),
    address: z
      .object({
        name: z.string().min(1, "Name is required"),
        street: z.string().min(1, "Street is required"),
        city: z.string().min(1, "City is required"),
        country: z.string().min(1, "Country is required"),
        zipCode: z.string().optional(),
      })
      .refine(
        (data) => {
          if (data.country.toUpperCase() === "US" && !data.zipCode) {
            return false;
          }
          return true;
        },
        {
          message: "Zip code is required for USA addresses",
          path: ["zipCode"],
        },
      ),
    title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
    description: z.string().optional(),
    actionText: z.string().min(1, "Action text is required").max(100, "Action text must be less than 100 characters"),
    actionLink: z.string().url("Action link must be a valid URL"),
  }),
});

export type UpdateEventInput = z.infer<typeof updateEventSchema>["body"];

export const profileIdQuerySchema = z.object({
  query: z.object({
    profileId: z.string().uuid(),
  }),
});
