import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

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
  email: emailSchema,
  password: passwordSchema,
  firstName: firstNameSchema,
  lastName: firstNameSchema,
});

const loginSchema = z.object({
  email: emailSchema,
  password: z.string({ required_error: "Password is required" }).min(1, "Password is required"),
});

const createPasswordSchema = z
  .object({
    password: passwordSchema,
    confirmPassword: passwordSchema,
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export const forgotPasswordResolver = zodResolver(forgotPasswordSchema);
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export type CreatePasswordInput = z.infer<typeof createPasswordSchema>;
export const createPasswordResolver = zodResolver(createPasswordSchema);

export type CreateAccountInput = z.infer<typeof createAccountSchema>;
export const createAccountResolver = zodResolver(createAccountSchema);
export type LoginInput = z.infer<typeof loginSchema>;
export const loginResolver = zodResolver(loginSchema);
