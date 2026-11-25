import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    /** Encrypted backend access token stored in the session cookie */
    accessToken?: string;
    /** Encrypted backend refresh token stored in the session cookie */
    refreshToken?: string;
    /** User's role: 'student' | 'teacher' | 'admin' */
    role?: string;
    /** User ID from the backend */
    backendId?: string;
    /** Display name from the backend */
    name?: string;
    /** Access token expiry timestamp (unix seconds) */
    accessTokenExpires?: number;
  }

  interface Session {
    role?: string;
    backendId?: string;
    /** Whether the access token has expired and needs refresh */
    error?: "RefreshAccessTokenError" | "AuthenticationServiceUnavailable";
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    /** Encrypted backend access token */
    accessToken?: string;
    /** Encrypted backend refresh token */
    refreshToken?: string;
    role?: string;
    backendId?: string;
    name?: string;
    /** Unix timestamp (ms) when the access token expires */
    accessTokenExpires?: number;
    error?: "RefreshAccessTokenError" | "AuthenticationServiceUnavailable";
  }
}
