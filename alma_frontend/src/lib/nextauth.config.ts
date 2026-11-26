import { createHash } from "node:crypto";
import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { encode } from "next-auth/jwt";
import { encryptToken, decryptToken } from "@/utils/tokenEncryption";
import { allowedRequestOrigin, authSigningSecret, backendApiUrl, secureAuthCookies } from "./request-security";

const SESSION_SECONDS = 60 * 60 * 24 * 30;
const roles = new Set(["student", "teacher", "parent", "admin"]);
const refreshes = new Map<
  string,
  { expires: number; promise: Promise<Refreshed | "unavailable" | null> }
>();
type Refreshed = {
  accessToken: string;
  refreshToken: string;
  accessTokenExpires: number;
};
type UserProfile = {
  _id?: string;
  id?: string;
  first_name?: string;
  last_name?: string;
  name?: string;
  role?: string;
};

function accessExpiry(token: string): number {
  const payload = JSON.parse(
    Buffer.from(token.split(".")[1], "base64url").toString("utf8"),
  ) as { exp?: number };
  if (!payload.exp || !Number.isFinite(payload.exp))
    throw new Error("Invalid authentication response");
  return payload.exp * 1000;
}

async function refreshAccessToken(
  encryptedRefresh: string,
): Promise<Refreshed | "unavailable" | null> {
  const key = createHash("sha256").update(encryptedRefresh).digest("hex");
  const existing = refreshes.get(key);
  if (existing && existing.expires > Date.now()) return existing.promise;
  if (refreshes.size >= 1000) refreshes.delete(refreshes.keys().next().value!);
  const promise = (async () => {
    try {
      const raw = await decryptToken(encryptedRefresh);
      if (!raw) return null;
      const response = await fetch(`${backendApiUrl()}/auth/refresh-token`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken: raw }),
        cache: "no-store",
        signal: AbortSignal.timeout(15000),
      });
      if (response.status === 429 || response.status >= 500)
        return "unavailable";
      if (!response.ok) return null;
      const { data } = await response.json();
      if (
        typeof data?.accessToken !== "string" ||
        typeof data?.refreshToken !== "string"
      )
        return null;
      const [accessToken, refreshToken] = await Promise.all([
        encryptToken(data.accessToken),
        encryptToken(data.refreshToken),
      ]);
      return {
        accessToken,
        refreshToken,
        accessTokenExpires: accessExpiry(data.accessToken),
      };
    } catch {
      return "unavailable";
    }
  })();
  // Parallel requests from the same browser share one rotation rather than reusing the old token.
  refreshes.set(key, { expires: Date.now() + 20000, promise });
  return promise;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" },
        rememberMe: { label: "Remember me", type: "checkbox" },
      },
      async authorize(credentials) {
        if (
          typeof credentials?.email !== "string" ||
          typeof credentials.password !== "string" ||
          credentials.email.length > 254 ||
          credentials.password.length > 128
        )
          return null;
        const role = credentials.role || "student";
        if (!roles.has(role)) return null;
        const email = credentials.email.toLowerCase().trim();
        let response: Response;
        try {
          response = await fetch(`${backendApiUrl()}/${role}s/login`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password: credentials.password }),
            cache: "no-store",
            signal: AbortSignal.timeout(15000),
          });
        } catch {
          throw new Error("AuthenticationServiceUnavailable");
        }
        if (response.status === 429) throw new Error("TooManyRequests");
        if (response.status >= 500) throw new Error("AuthenticationServiceUnavailable");
        if (!response.ok) return null;
        try {
          const { data } = await response.json();
          if (
            typeof data?.accessToken !== "string" ||
            typeof data?.refreshToken !== "string"
          )
            return null;
          const profile = data[role] as UserProfile | undefined;
          if (
            !profile ||
            (profile.role && profile.role !== role) ||
            !(profile._id || profile.id)
          )
            return null;
          const [accessToken, refreshToken] = await Promise.all([
            encryptToken(data.accessToken),
            encryptToken(data.refreshToken),
          ]);
          return {
            id: String(profile._id || profile.id),
            backendId: String(profile._id || profile.id),
            role,
            rememberMe: credentials.rememberMe === "true",
            name:
              `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
              profile.name ||
              email,
            email,
            accessToken,
            refreshToken,
            accessTokenExpires: accessExpiry(data.accessToken),
          };
        } catch {
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user)
        return {
          ...token,
          accessToken: user.accessToken,
          refreshToken: user.refreshToken,
          role: user.role,
          rememberMe: user.rememberMe,
          backendId: user.backendId,
          name: user.name || undefined,
          accessTokenExpires: user.accessTokenExpires,
          error: undefined,
        };
      if (
        token.accessTokenExpires &&
        Date.now() < token.accessTokenExpires - 30000
      )
        return token;
      if (typeof token.refreshToken === "string") {
        const refreshed = await refreshAccessToken(token.refreshToken);
        if (refreshed === "unavailable")
          return { ...token, error: "AuthenticationServiceUnavailable" };
        if (refreshed) return { ...token, ...refreshed, error: undefined };
      }
      return { ...token, error: "RefreshAccessTokenError" };
    },
    async session({ session, token }) {
      // Only identity and session status are sent to the browser.
      session.role = token.role;
      session.backendId = token.backendId;
      session.error = token.error;
      if (typeof token.exp === "number") session.expires = new Date(token.exp * 1000).toISOString();
      return session;
    },
    async redirect({ url, baseUrl }) {
      try {
        const target = new URL(url, baseUrl);
        return allowedRequestOrigin(target.origin, baseUrl)
          ? target.href
          : baseUrl;
      } catch {
        return baseUrl;
      }
    },
  },
  events: {
    async signOut({ token }) {
      if (!token) return;
      try {
        const refreshToken =
          typeof token.refreshToken === "string"
            ? await decryptToken(token.refreshToken)
            : null;
        const accessToken =
          typeof token.accessToken === "string"
            ? await decryptToken(token.accessToken)
            : null;
        await fetch(`${backendApiUrl()}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
          },
          body: JSON.stringify({ refreshToken }),
          cache: "no-store",
          signal: AbortSignal.timeout(10000),
        });
      } catch {
        /* Local cookies are removed even if the backend is temporarily unavailable. */
      }
    },
  },
  pages: { signIn: "/login" },
  session: { strategy: "jwt", maxAge: SESSION_SECONDS },
  jwt: {
    maxAge: SESSION_SECONDS,
    encode: (params) => encode({
      ...params,
      maxAge: params.token?.rememberMe === false ? 24 * 60 * 60 : SESSION_SECONDS,
    }),
  },
  secret: authSigningSecret(),
  useSecureCookies: secureAuthCookies(),
};
