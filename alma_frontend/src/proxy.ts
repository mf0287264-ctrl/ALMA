import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { authSigningSecret, backendApiUrl } from "@/lib/request-security";

const protectedPages = [
  "/home",
  "/profile",
  "/learn",
  "/lesson",
  "/my-lessons",
  "/courses",
  "/assessments",
  "/compete",
  "/quize",
  "/ai-lesson",
  "/achievements",
  "/teachers",
  "/teacher",
  "/parent",
  "/feeds",
  "/feed",
  "/friends",
  "/messages",
  "/admin",
];
const under = (path: string, prefix: string) =>
  path === prefix || path.startsWith(`${prefix}/`);

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(
    crypto.getRandomValues(new Uint8Array(16)),
  ).toString("base64");
  const dev = process.env.NODE_ENV === "development";
  let assetOrigin = "";
  try {
    assetOrigin = new URL(backendApiUrl()).origin;
  } catch {}
  const policy = [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${dev ? " 'unsafe-eval'" : ""}`,
    "script-src-attr 'none'",
    `style-src 'self' ${dev ? "'unsafe-inline'" : `'nonce-${nonce}' 'sha256-${process.env.SONNER_CSP_STYLE_HASH}' 'sha256-47DEQpj8HBSa+/TImW+5JCeuQeRkm5NMpJWZG3hSuFU='`}`,
    "style-src-attr 'unsafe-inline'",
    `img-src 'self' data: blob: https:${dev && assetOrigin ? ` ${assetOrigin}` : ""}`,
    `media-src 'self' https:${dev && assetOrigin ? ` ${assetOrigin}` : ""}`,
    "font-src 'self' data:",
    `connect-src 'self'${dev ? " ws://127.0.0.1:3000 ws://localhost:3000 ws://127.0.0.1:3001" : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(dev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", policy);
  let response = NextResponse.next({ request: { headers } });
  if (
    protectedPages.some((prefix) => under(request.nextUrl.pathname, prefix))
  ) {
    let token = null;
    try {
      token = await getToken({
        req: request,
        secret: authSigningSecret(),
        secureCookie: process.env.NODE_ENV === "production",
      });
    } catch {}
    if (
      !token ||
      token.error === "RefreshAccessTokenError" ||
      !["student", "teacher", "parent", "admin"].includes(String(token.role))
    ) {
      const login = new URL("/login", request.url);
      if (under(request.nextUrl.pathname, "/teacher"))
        login.searchParams.set("role", "teacher");
      if (under(request.nextUrl.pathname, "/parent"))
        login.searchParams.set("role", "parent");
      login.searchParams.set(
        "callbackUrl",
        `${request.nextUrl.pathname}${request.nextUrl.search}`,
      );
      response = NextResponse.redirect(login);
    } else if (
      under(request.nextUrl.pathname, "/teacher") &&
      !["teacher", "admin"].includes(String(token.role))
    ) {
      response = NextResponse.redirect(
        new URL(
          token.role === "parent" ? "/parent/dashboard" : "/home",
          request.url,
        ),
      );
    } else if (
      under(request.nextUrl.pathname, "/parent") &&
      !["parent", "admin"].includes(String(token.role))
    ) {
      response = NextResponse.redirect(
        new URL(
          token.role === "teacher" ? "/teacher/dashboard" : "/home",
          request.url,
        ),
      );
    } else if (
      under(request.nextUrl.pathname, "/admin") &&
      token.role !== "admin"
    ) {
      response = NextResponse.redirect(new URL("/home", request.url));
    }
    response.headers.set("Cache-Control", "private, no-store");
  }
  response.headers.set("Content-Security-Policy", policy);
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "no-referrer");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), geolocation=(), payment=(), microphone=(self)",
  );
  if (!dev)
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
