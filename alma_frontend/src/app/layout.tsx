import type { Metadata } from "next";
import { Toaster } from "sonner";
import AuthProviders from "./_providers/AuthProviders";
import { AuthProvider } from "./_Context/AuthContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "ALMA",
  description: "ALMA Platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" style={{ fontFamily: "Gill Sans, sans-serif" }} className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-[#fff8ec]">
        {/*
          AuthProviders wraps everything with next-auth SessionProvider.
          AuthProvider (our custom context) sits inside so it can call useSession().
        */}
        <AuthProviders>
          <AuthProvider>
            {children}
            <Toaster position="top-left" richColors />
          </AuthProvider>
        </AuthProviders>
      </body>
    </html>
  );
}
