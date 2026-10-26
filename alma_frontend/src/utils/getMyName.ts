import { decode } from "next-auth/jwt";
import { cookies } from "next/headers";

export async function getMyName(): Promise<string | null> {
  const myCookies = await cookies();
  const tokenFromCookies =
    myCookies.get("next-auth.session-token")?.value ??
    myCookies.get("__Secure-next-auth.session-token")?.value;

  if (!tokenFromCookies) return null;

  const tokenAfterDecoded = await decode({
    token: tokenFromCookies,
    secret: process.env.NEXTAUTH_SECRET ?? process.env.AUTH_SECRET!,
  });

  return (tokenAfterDecoded?.name as string | undefined) ?? null;
}
