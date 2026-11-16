import { decode } from "next-auth/jwt";
import { cookies } from "next/headers";

/**
 * Server-only helper.
 * Returns the user's role ('student' | 'teacher' | 'admin') from the session cookie,
 * or null if unauthenticated.
 */
export async function getUserRole(): Promise<string | null> {
  const myCookies = await cookies();
  const tokenFromCookies =
    myCookies.get("next-auth.session-token")?.value ??
    myCookies.get("__Secure-next-auth.session-token")?.value;

  if (!tokenFromCookies) return null;

  const decoded = await decode({
    token: tokenFromCookies,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET!,
  });

  return (decoded?.role as string | undefined) ?? null;
}
