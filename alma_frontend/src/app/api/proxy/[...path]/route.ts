import { NextRequest, NextResponse } from "next/server";
import { getBackendSession } from "@/lib/server-auth";
import {
  allowedRequestOrigin,
  backendApiUrl,
  frontendRequestOrigin,
  readLimitedBody,
  safeBackendJson,
} from "@/lib/request-security";

export const dynamic = "force-dynamic";
const allowed = new Set([
  "students",
  "teachers",
  "parents",
  "admins",
  "users",
  "courses",
  "modules",
  "lessons",
  "lesson-generations",
  "assessments",
  "quizzes",
  "achievements",
  "posts",
  "messages",
  "teacher-groups",
  "health",
]);
const noStore = {
  "Cache-Control": "no-store, private",
  "X-Content-Type-Options": "nosniff",
};
type Context = { params: Promise<{ path: string[] }> };

async function handle(request: NextRequest, context: Context) {
  const { path } = await context.params;
  if (
    !path.length ||
    !allowed.has(path[0]) ||
    path.some(
      (segment) =>
        !segment ||
        [".", ".."].includes(segment) ||
        /[\\/\x00-\x1f]/.test(segment),
    )
  )
    return NextResponse.json(
      { error: "Resource not found." },
      { status: 404, headers: noStore },
    );
  if (path[1] === "login")
    return NextResponse.json(
      { error: "Use the sign-in form." },
      { status: 403, headers: noStore },
    );
  const unsafe = !["GET", "HEAD"].includes(request.method);
  if (
    (unsafe &&
      !allowedRequestOrigin(request.headers.get("origin"), frontendRequestOrigin(request))) ||
    request.headers.get("sec-fetch-site") === "cross-site"
  )
    return NextResponse.json(
      { error: "Request origin is not allowed." },
      { status: 403, headers: noStore },
    );
  const publicRequest =
    (!unsafe && path[0] === "courses") ||
    (!unsafe && path[0] === "health") ||
    (request.method === "POST" &&
      path.length === 1 &&
      ["students", "teachers", "parents"].includes(path[0]));
  try {
    const session = await getBackendSession();
    if (!publicRequest && session?.error === "AuthenticationServiceUnavailable")
      return NextResponse.json(
        {
          error: "Authentication is temporarily unavailable. Please try again.",
        },
        { status: 503, headers: noStore },
      );
    if (!publicRequest && (!session?.backendAccessToken || session.error))
      return NextResponse.json(
        { error: "Authentication required." },
        { status: 401, headers: noStore },
      );
    const headers = new Headers({ Accept: "application/json" });
    if (session?.backendAccessToken)
      headers.set("Authorization", `Bearer ${session.backendAccessToken}`);
    const type = request.headers.get("content-type");
    if (
      unsafe &&
      type &&
      !/^(application\/json|multipart\/form-data)(?:;|$)/i.test(type)
    )
      return NextResponse.json(
        { error: "Unsupported request format." },
        { status: 415, headers: noStore },
      );
    if (type) headers.set("Content-Type", type);
    const bytes = unsafe
      ? await readLimitedBody(request.body, 5 * 1024 * 1024)
      : undefined;
    const base = new URL(backendApiUrl());
    if (
      !["http:", "https:"].includes(base.protocol) ||
      base.username ||
      base.password
    )
      throw new Error("INVALID_BACKEND");
    const target = `${base.href.replace(/\/$/, "")}/${path.map(encodeURIComponent).join("/")}${request.nextUrl.search}`;
    const response = await fetch(target, {
      method: request.method,
      headers,
      ...(bytes?.byteLength ? { body: bytes as BodyInit } : {}),
      cache: "no-store",
      redirect: "manual",
      signal: AbortSignal.timeout(20000),
    });
    if (response.status === 204 || request.method === "HEAD")
      return new NextResponse(null, {
        status: response.status,
        headers: noStore,
      });
    if (response.status >= 300 && response.status < 400)
      return NextResponse.json(
        { error: "Unexpected backend redirect." },
        { status: 502, headers: noStore },
      );
    const content = await readLimitedBody(response.body, 5 * 1024 * 1024);
    const result: unknown = JSON.parse(new TextDecoder().decode(content));
    return NextResponse.json(safeBackendJson(result), {
      status: response.status,
      headers: noStore,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error && error.message === "BODY_TOO_LARGE"
            ? "The request is too large."
            : "The service is unavailable. Please try again.",
      },
      {
        status:
          error instanceof Error && error.message === "BODY_TOO_LARGE"
            ? 413
            : 502,
        headers: noStore,
      },
    );
  }
}
export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const HEAD = handle;
