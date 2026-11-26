import { isAxiosError } from "axios";

export function apiError(error: unknown, fallback: string): string {
  if (isAxiosError<{ error?: string; message?: string; details?: { message?: string }[] }>(error)) {
    const data = error.response?.data;
    return data?.details?.[0]?.message || data?.error || data?.message || fallback;
  }
  return fallback;
}

export function signInError(code?: string | null): string {
  if (code === "AuthenticationServiceUnavailable") return "Sign-in is temporarily unavailable. Please try again in a moment.";
  if (code === "TooManyRequests") return "Too many sign-in attempts. Please wait a few minutes and try again.";
  if (code === "SessionNotSaved") return "Your sign-in could not be saved. Please allow cookies for this site and try again.";
  return "Email or password is incorrect. Check that you selected the right account type.";
}
