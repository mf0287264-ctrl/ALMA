import type { Metadata } from "next";
import { Toaster } from "sonner";
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
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-left" richColors />
      </body>
    </html>
  );
}
