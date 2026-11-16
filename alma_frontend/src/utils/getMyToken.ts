import { decode } from "next-auth/jwt";
import { cookies } from "next/headers";
import { decryptToken } from "@/utils/tokenEncryption";

/**
 * Server-only helper.
 * Reads the next-auth session cookie, decodes the JWT, then decrypts the
 * encrypted backend access token stored inside it.
 *
 * Returns the raw backend JWT string, or null if unauthenticated / decryption fails.
 */
export async function getMyToken(): Promise<string | null> {
  const myCookies = await cookies();
  const tokenFromCookies =
    myCookies.get("next-auth.session-token")?.value ??
    myCookies.get("__Secure-next-auth.session-token")?.value;

  if (!tokenFromCookies) return null;

  const decoded = await decode({
    token: tokenFromCookies,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET!,
  });

  if (!decoded?.accessToken) return null;

  // Decrypt the encrypted backend token
  return await decryptToken(decoded.accessToken as string);
}
