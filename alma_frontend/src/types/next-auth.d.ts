import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface User {
    realTokenFromBackend?: string;
  }
  interface Session {
    realTokenFromBackend?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    realTokenFromBackend?: string;
    role?: string;
  }
}
