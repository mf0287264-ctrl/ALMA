import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth.config";

export async function getUserRole(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.role || null;
}
