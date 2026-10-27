import * as z from "zod";

export const registerSchema = z
  .object({
    name: z.string().min(2, "Full name is required"),
    email: z.string().email("Enter a valid email address."),
    password: z.string().min(8, "At least 8 characters"),
    rePassword: z.string(),
    agreeToTerms: z.boolean().refine((val) => val === true, {
      message: "You must agree to the Terms and Privacy Policy",
    }),
  })
  .refine((data) => data.password === data.rePassword, {
    message: "Passwords don't match.",
    path: ["rePassword"],
  });

export type RegisterInputType = z.infer<typeof registerSchema>;
