import NextAuth from "next-auth";
import type { NextRequest } from "next/server";
import { authOptions, authRedirect } from "@/lib/nextauth.config";
import { frontendRequestOrigin } from "@/lib/request-security";

function handler(request: NextRequest, context: { params: Promise<{ nextauth: string[] }> }) {
  const baseUrl = frontendRequestOrigin(request);
  return NextAuth(request, context, {
    ...authOptions,
    callbacks: {
      ...authOptions.callbacks,
      redirect: ({ url }) => authRedirect({ url, baseUrl }),
    },
  });
}

export { handler as GET, handler as POST };
