import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { authSigningSecret, backendApiUrl, frontendRequestOrigin, secureAuthCookies } from "@/lib/request-security";
import { protectedPages, under } from "@/lib/auth-routes";

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(
    crypto.getRandomValues(new Uint8Array(16)),
  ).toString("base64");
  const dev = process.env.NODE_ENV === "development";
  const secureCookies = secureAuthCookies();
  const devPort = request.nextUrl.port || "3000";
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
    `media-src 'self' blob: https:${dev && assetOrigin ? ` ${assetOrigin}` : ""}`,
    "font-src 'self' data:",
    `connect-src 'self'${dev ? ` ws://127.0.0.1:${devPort} ws://localhost:${devPort} ws://[::1]:${devPort}` : ""}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(dev || !secureCookies ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", policy);
  let response = NextResponse.next({ request: { headers } });
  if (
    protectedPages.some((prefix) => under(request.nextUrl.pathname, prefix))
  ) {
    const origin = frontendRequestOrigin(request);
    let token = null;
    try {
      token = await getToken({
        req: request,
        secret: authSigningSecret(),
        secureCookie: secureCookies,
      });
    } catch {}
    if (
      !token ||
      token.error === "RefreshAccessTokenError" ||
      !["student", "teacher", "parent", "admin"].includes(String(token.role))
    ) {
      const login = new URL("/login", origin);
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
          origin,
        ),
      );
    } else if (
      under(request.nextUrl.pathname, "/parent") &&
      !["parent", "admin"].includes(String(token.role))
    ) {
      response = NextResponse.redirect(
        new URL(
          token.role === "teacher" ? "/teacher/dashboard" : "/home",
          origin,
        ),
      );
    } else if (
      under(request.nextUrl.pathname, "/admin") &&
      token.role !== "admin"
    ) {
      response = NextResponse.redirect(new URL("/home", origin));
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
  if (!dev && secureCookies)
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains",
    );
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
