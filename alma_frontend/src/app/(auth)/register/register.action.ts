"use server";

import { RegisterInputType, registerSchema } from "./register.schema";

export async function registerAction(data: RegisterInputType) {
  const parsed = registerSchema.safeParse(data);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  // Registration backend call logic will go here
  return { success: true };
}
