import z from "zod";

export const firstNameSchema = z
  .string({
    required_error: "First name is required",
    invalid_type_error: "First name is invalid",
  })
  .trim()
  .max(25, "First name is too long")
  .regex(/^[a-zA-Z ]+$/, "First name is invalid");
const passwordSchema = z
  .string({ required_error: "Password is required" })
  .min(8, "Password is too short, should be at least 8 characters");

const emailSchema = z
  .string({ required_error: "Email is required" })
  .trim()
  .max(255, "Email is too long")
  .toLowerCase()
  .email("Email is invalid");

export const createAccountSchema = z.object({
  body: z.object({
    email: emailSchema,
    password: passwordSchema,
    firstName: firstNameSchema,
    lastName: firstNameSchema,
  }),
});

export type CreateAccountInput = z.infer<typeof createAccountSchema>["body"];
