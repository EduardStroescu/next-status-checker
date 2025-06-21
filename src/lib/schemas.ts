import * as z from "zod/v4";

export const signupSchema = z
  .object({
    email: z.email({ error: "A valid email is required" }).toLowerCase(),
    username: z
      .string()
      .describe("username")
      .min(5, "The username must be at least 5 characters long"),
    avatar: z.url().optional().nullable(),
    password: z
      .string({ error: "Password is required." })
      .describe("Password")
      .min(5, "Password must be at least 5 characters long")
      .max(20, "Password must be at most 20 characters long"),
    confirmPassword: z
      .string()
      .min(5, {
        message: "Confirm password must be at least 5 characters long",
      })
      .max(20, {
        message: "Confirm password must be at most 20 characters long",
      }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
