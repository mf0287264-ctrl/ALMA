import "server-only";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/nextauth.config";

export async function getMyName(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.name || null;
}
