import { z } from "zod";
import { paginationSchema } from "../schema";

export const getEventsSchema = z.object({
  query: z.object({
    profileId: z.string().uuid(),
    ...paginationSchema.shape,
  }),
});

export const createRoomSchema = z.object({
  body: z.object({
    profileId: z.string().uuid(),
    username: z.string().min(1, "Username is required"),
    userTitle: z.string().optional(),
  }),
});

export type CreateRoomInput = z.infer<typeof createRoomSchema>["body"];
export type GetEventsInput = z.infer<typeof getEventsSchema>["query"];

export const createEventSchema = z.object({
  body: z.object({
    profileId: z.string().uuid(),
    dateTime: z.string().datetime(),
    coverImage: z
      .object({
        file: z.string().url("Cover image must be a valid URL"),
        fileSize: z.number(),
        fileName: z.string().min(1, "Name is required"),
      })
      .optional(),
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
    actionText: z
      .string()
      .min(1, "Action text is required")
      .max(100, "Action text must be less than 100 characters")
      .optional(),
    actionLink: z.string().url("Action link must be a valid URL").optional(),
  }),
});

export type CreateEventInput = z.infer<typeof createEventSchema>["body"];

export const updateEventSchema = z.object({
  body: z.object({
    id: z.string().uuid(),
    profileId: z.string().uuid(),
    dateTime: z.string().datetime(),
    coverImage: z
      .object({
        file: z.string().url("Cover image must be a valid URL"),
        fileSize: z.number(),
        fileName: z.string().min(1, "Name is required"),
      })
      .optional(),
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
    actionText: z.string().max(100, "Action text must be less than 100 characters").optional(),
    actionLink: z.string().optional(),
  }),
});

export type UpdateEventInput = z.infer<typeof updateEventSchema>["body"];

export const profileIdQuerySchema = z.object({
  query: z.object({
    profileId: z.string().uuid(),
  }),
});

export const createTicketSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string(),
    price: z.number().min(0, "Price must be greater than 0"),
    quantity: z.number().min(1, "Quantity must be greater than 0"),
    profileId: z.string().uuid(),
  }),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>["body"];

export const updateTicketSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string(),
    price: z.number().min(0, "Price must be greater than 0"),
    quantity: z.number().min(1, "Quantity must be greater than 0"),
    profileId: z.string().uuid(),
  }),
});

export type UpdateTicketInput = z.infer<typeof updateTicketSchema>["body"];

export const reorderTicketsSchema = z.object({
  body: z.object({
    ticketOrders: z.array(z.object({ id: z.string().uuid(), order: z.number() })),
  }),
});

export type ReorderTicketsInput = z.infer<typeof reorderTicketsSchema>["body"];

export const getOrdersSchema = z.object({
  query: z.object({
    profileId: z.string(),
    ...paginationSchema.shape,
  }),
});

export type GetOrdersInput = z.infer<typeof getOrdersSchema>["query"];
