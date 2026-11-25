import { NextRequest, NextResponse } from "next/server";
import { backendApiUrl, readLimitedBody } from "@/lib/request-security";

export const dynamic = "force-dynamic";
export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  const { path } = await context.params;
  if (
    path.length < 2 ||
    path.length > 4 ||
    !["uploads", "uploaded"].includes(path[0]) ||
    path.some(
      (segment) => !/^[a-zA-Z0-9_-]+(?:\.(?:png|jpe?g|webp))?$/.test(segment),
    ) ||
    !/\.(png|jpe?g|webp)$/i.test(path.at(-1) || "")
  )
    return new NextResponse(null, { status: 404 });
  try {
    const base = new URL(backendApiUrl());
    const response = await fetch(
      `${base.origin}/${path.map(encodeURIComponent).join("/")}`,
      {
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(10000),
      },
    );
    const mime = response.headers.get("content-type")?.split(";")[0];
    if (
      !response.ok ||
      !mime ||
      !["image/png", "image/jpeg", "image/webp"].includes(mime)
    )
      return new NextResponse(null, { status: 404 });
    const bytes = await readLimitedBody(response.body, 4 * 1024 * 1024);
    const signature =
      mime === "image/png"
        ? bytes.length >= 8 &&
          [137, 80, 78, 71, 13, 10, 26, 10].every(
            (value, index) => bytes[index] === value,
          )
        : mime === "image/jpeg"
          ? bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255
          : new TextDecoder().decode(bytes.slice(0, 4)) === "RIFF" &&
            new TextDecoder().decode(bytes.slice(8, 12)) === "WEBP";
    if (!signature) return new NextResponse(null, { status: 404 });
    return new NextResponse(bytes as BodyInit, {
      headers: {
        "Content-Type": mime,
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "sandbox; default-src 'none'",
        "Cache-Control": "private, max-age=300",
      },
    });
  } catch {
    return new NextResponse(null, { status: 502 });
  }
}
