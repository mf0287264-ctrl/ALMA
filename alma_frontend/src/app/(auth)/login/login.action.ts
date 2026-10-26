"use server";

import { formDataInputType, logInSchema } from "./login.schema";

export async function loginAction(formData: formDataInputType) {
  const parsed = logInSchema.safeParse(formData);
  if (!parsed.success) {
    return { success: false, errors: parsed.error.flatten().fieldErrors };
  }

  return { success: true };
}
