import { decode } from "next-auth/jwt";
import { cookies } from "next/headers";

/**
 * Server-only helper.
 * Returns the backend user ID stored in the session cookie, or null.
 */
export async function getUserId(): Promise<string | null> {
  const myCookies = await cookies();
  const tokenFromCookies =
    myCookies.get("next-auth.session-token")?.value ??
    myCookies.get("__Secure-next-auth.session-token")?.value;

  if (!tokenFromCookies) return null;

  const decoded = await decode({
    token: tokenFromCookies,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET!,
  });

  // backendId was stored explicitly; fall back to sub
  return (decoded?.backendId as string | undefined) ?? (decoded?.sub as string | undefined) ?? null;
}
