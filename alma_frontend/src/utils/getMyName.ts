import { decode } from "next-auth/jwt";
import { cookies } from "next/headers";

/**
 * Server-only helper.
 * Returns the user's display name from the session cookie, or null.
 */
export async function getMyName(): Promise<string | null> {
  const myCookies = await cookies();
  const tokenFromCookies =
    myCookies.get("next-auth.session-token")?.value ??
    myCookies.get("__Secure-next-auth.session-token")?.value;

  if (!tokenFromCookies) return null;

  const decoded = await decode({
    token: tokenFromCookies,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET!,
  });

  return (decoded?.name as string | undefined) ?? null;
}
