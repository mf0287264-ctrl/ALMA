import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        // Custom authentication logic goes here
        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.realTokenFromBackend = (user as unknown as { realTokenFromBackend?: string }).realTokenFromBackend;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        (session as unknown as { realTokenFromBackend?: string }).realTokenFromBackend = token.realTokenFromBackend as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
