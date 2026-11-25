export const backendApiUrl = () =>
  (
    process.env.BACKEND_API_URL ||
    process.env.NEXT_PUBLIC_BASE_API ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://127.0.0.1:5000/api/v1"
  ).replace(/\/$/, "");

export function authSigningSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (
    !secret ||
    new TextEncoder().encode(secret).byteLength < 32 ||
    /^(your[_-]|replace[_-]?me|changeme)/i.test(secret)
  )
    throw new Error(
      "NEXTAUTH_SECRET requires at least 32 bytes of random secret material.",
    );
  return secret;
}

export function allowedRequestOrigin(
  origin: string | null,
  target: string,
): boolean {
  if (!origin) return false;
  try {
    const actual = new URL(origin).origin;
    const configured = process.env.NEXTAUTH_URL
      ? new URL(process.env.NEXTAUTH_URL).origin
      : new URL(target).origin;
    const requested = new URL(target);
    return (
      actual === configured ||
      (process.env.NODE_ENV !== "production" &&
        ["localhost", "127.0.0.1", "[::1]"].includes(requested.hostname) &&
        actual === requested.origin)
    );
  } catch {
    return false;
  }
}

export async function readLimitedBody(
  stream: ReadableStream<Uint8Array> | null,
  maxBytes: number,
): Promise<Uint8Array> {
  if (!stream) return new Uint8Array();
  const reader = stream.getReader(),
    chunks: Uint8Array[] = [];
  let length = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      length += value.byteLength;
      if (length > maxBytes) {
        await reader.cancel();
        throw new Error("BODY_TOO_LARGE");
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const result = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    result.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return result;
}

export function safeBackendJson(value: unknown): unknown {
  if (!value || typeof value !== "object") return value;
  if (Array.isArray(value)) return value.map(safeBackendJson);
  const secrets = new Set([
    "accessToken",
    "refreshToken",
    "password",
    "password_hash",
    "refresh_hash",
    "api_key",
    "gemini_api_key",
    "geminiApiKey",
    "hf_api_token",
    "__proto__",
    "prototype",
    "constructor",
  ]);
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !secrets.has(key))
      .map(([key, child]) => [key, safeBackendJson(child)]),
  );
}
