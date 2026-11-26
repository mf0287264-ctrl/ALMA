import * as z from "zod";

export const logInSchema = z.object({
  email: z.string().trim().toLowerCase().max(254).email("Enter a valid email address."),
  password: z.string().min(1, "Enter your password.").max(128, "Password is too long."),
});

export type formDataInputType = z.infer<typeof logInSchema>;
