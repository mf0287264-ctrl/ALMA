import "server-only";
import { getServerSession } from "next-auth";
import type { Session } from "next-auth";
import { authOptions } from "./nextauth.config";
import { decryptToken } from "@/utils/tokenEncryption";

type BackendSession = Session & { backendAccessToken?: string | null };

/** Uses a private callback only inside server code; browser sessions never include these tokens. */
export async function getBackendSession(): Promise<BackendSession | null> {
  return (await getServerSession({
    ...authOptions,
    callbacks: {
      ...authOptions.callbacks,
      async session({ session, token }) {
        return {
          ...session,
          role: token.role,
          backendId: token.backendId,
          error: token.error,
          backendAccessToken:
            token.error || typeof token.accessToken !== "string"
              ? null
              : await decryptToken(token.accessToken),
        };
      },
    },
  })) as BackendSession | null;
}
