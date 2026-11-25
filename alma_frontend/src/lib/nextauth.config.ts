import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { encryptToken, decryptToken } from "@/utils/tokenEncryption";

const API_BASE = process.env.NEXT_PUBLIC_BASE_API || "http://localhost:5000/api/v1";

/** 30 days in seconds (matches backend JWT_ACCESS_EXPIRES_IN=30d) */
const ACCESS_TOKEN_LIFETIME_S = 60 * 60 * 24 * 30;

/**
 * Call the backend refresh endpoint and return new encrypted token pair,
 * or null if the refresh token itself has expired / been invalidated.
 */
async function refreshAccessToken(
  encryptedRefreshToken: string
): Promise<{ accessToken: string; refreshToken: string; accessTokenExpires: number } | null> {
  try {
    const rawRefreshToken = await decryptToken(encryptedRefreshToken);
    if (!rawRefreshToken) return null;

    const res = await fetch(`${API_BASE}/auth/refresh-token`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: rawRefreshToken }),
    });

    if (!res.ok) return null;

    const json = await res.json();
    const { accessToken: newAccess, refreshToken: newRefresh } = json?.data ?? {};
    if (!newAccess || !newRefresh) return null;

    const [encAccess, encRefresh] = await Promise.all([
      encryptToken(newAccess),
      encryptToken(newRefresh),
    ]);

    return {
      accessToken: encAccess,
      refreshToken: encRefresh,
      accessTokenExpires: Date.now() + ACCESS_TOKEN_LIFETIME_S * 1000,
    };
  } catch {
    return null;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        role: { label: "Role", type: "text" }, // 'student' | 'teacher' | 'admin'
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const role = credentials.role || "student";
        let endpoint = "/students/login";
        if (role === "teacher") {
          endpoint = "/teachers/login";
        } else if (role === "parent") {
          endpoint = "/parents/login";
        } else if (role === "admin") {
          endpoint = "/admins/login";
        }

        const cleanEmail = credentials.email.toLowerCase().trim();

        try {
          const res = await fetch(`${API_BASE}${endpoint}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: cleanEmail,
              password: credentials.password,
            }),
          });

          if (!res.ok) {
            const jsonErr = await res.json().catch(() => null);
            const msg =
              jsonErr?.message ||
              jsonErr?.error ||
              `Invalid credentials for ${role} portal`;
            throw new Error(msg);
          }

          const json = await res.json();
          const data = json?.data;
          if (!data?.accessToken || !data?.refreshToken) {
            throw new Error("No tokens returned from server");
          }

          const userObj =
            (role === "student" && data.student) ||
            (role === "teacher" && data.teacher) ||
            (role === "parent" && data.parent) ||
            (role === "admin" && data.admin) ||
            data.student ||
            data.teacher ||
            data.parent ||
            data.admin ||
            {};

          // Encrypt tokens before storing them in the cookie
          const [encAccess, encRefresh] = await Promise.all([
            encryptToken(data.accessToken),
            encryptToken(data.refreshToken),
          ]);

          return {
            id: userObj._id?.toString() || userObj.id?.toString() || cleanEmail,
            name: `${userObj.first_name || ""} ${userObj.last_name || ""}`.trim() || userObj.name || cleanEmail,
            email: cleanEmail,
            // Custom fields stored in next-auth JWT
            accessToken: encAccess,
            refreshToken: encRefresh,
            role: role,
            backendId: userObj._id?.toString() || userObj.id?.toString(),
            accessTokenExpires: Date.now() + ACCESS_TOKEN_LIFETIME_S * 1000,
          };
        } catch (err: any) {
          throw new Error(err.message || "Authentication failed");
        }
      },
    }),
  ],

  callbacks: {
    /**
     * jwt callback — runs every time a JWT is created or refreshed.
     * Stores encrypted tokens and handles automatic refresh rotation.
     */
    async jwt({ token, user }) {
      // First sign-in: user object is populated by authorize()
      if (user) {
        token.accessToken = user.accessToken;
        token.refreshToken = user.refreshToken;
        token.role = user.role;
        token.backendId = user.backendId;
        token.name = user.name ?? undefined;
        token.accessTokenExpires = user.accessTokenExpires;
        token.error = undefined;
        return token;
      }

      // Token still valid → pass through
      if (
        token.accessTokenExpires &&
        Date.now() < token.accessTokenExpires
      ) {
        return token;
      }

      // Access token has expired — attempt silent refresh
      if (token.refreshToken) {
        const refreshed = await refreshAccessToken(token.refreshToken);
        if (refreshed) {
          return {
            ...token,
            accessToken: refreshed.accessToken,
            refreshToken: refreshed.refreshToken,
            accessTokenExpires: refreshed.accessTokenExpires,
            error: undefined,
          };
        }
        // Refresh token also expired/invalid — user must re-login
        return { ...token, error: "RefreshAccessTokenError" };
      }

      return token;
    },

    /**
     * session callback — exposes selected JWT fields to the client via useSession().
     * Raw tokens are NEVER sent to the client — they remain server-side encrypted.
     */
    async session({ session, token }) {
      // Expose encrypted tokens to Server Components / API routes (not to the browser directly)
      session.accessToken = token.accessToken;
      session.refreshToken = token.refreshToken;
      session.role = token.role;
      session.backendId = token.backendId;
      session.error = token.error;
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  session: {
    strategy: "jwt",
    // Session max age matches the refresh token lifetime (30 days)
    maxAge: ACCESS_TOKEN_LIFETIME_S,
  },

  jwt: {
    // JWT cookie max age = 30 days
    maxAge: ACCESS_TOKEN_LIFETIME_S,
  },

  secret: process.env.NEXTAUTH_SECRET,
};
