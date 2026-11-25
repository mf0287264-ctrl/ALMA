import "server-only";
import { getBackendSession } from "@/lib/server-auth";

export async function getMyToken(): Promise<string | null> {
  const session = await getBackendSession();
  return session?.backendAccessToken || null;
}
