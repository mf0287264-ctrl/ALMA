import type { Metadata } from "next";
import { Toaster } from "sonner";
import AuthProviders from "./_providers/AuthProviders";
import { AuthProvider } from "./_Context/AuthContext";
import { SidebarProvider } from "./_Context/SidebarContext";
import "./globals.css";

export const metadata: Metadata = {
  title: "ALMA",
  description: "ALMA Platform",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Browser extensions can add attributes to <html> before React hydrates.
    // Keep the exception on this element; descendants still receive hydration checks.
    <html
      lang="en"
      className="h-full antialiased"
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-screen flex flex-col bg-[#fff8ec]">
        {/*
          AuthProviders wraps everything with next-auth SessionProvider.
          AuthProvider (our custom context) sits inside so it can call useSession().
        */}
        <AuthProviders>
          <AuthProvider>
            <SidebarProvider>
              {children}
              <Toaster position="top-left" richColors />
            </SidebarProvider>
          </AuthProvider>
        </AuthProviders>
      </body>
    </html>
  );
}
