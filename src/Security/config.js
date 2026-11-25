import dotenv from "dotenv";
dotenv.config();

export function requiredSecret(name) {
  const value = process.env[name];
  if (
    !value ||
    Buffer.byteLength(value) < 32 ||
    /^(?:changeme|replace[_-]?me|your[_-])|alma_jwt_.*_2026/i.test(value)
  ) {
    throw new Error(
      `${name} must be configured with at least 32 bytes of random secret material.`,
    );
  }
  return value;
}

export function validateSecurityConfig() {
  const access = requiredSecret("JWT_SECRET");
  const refresh = requiredSecret("JWT_REFRESH_SECRET");
  if (access === refresh)
    throw new Error("Access and refresh signing keys must be different.");
  if (process.env.NODE_ENV === "production") {
    const origins = (process.env.CORS_ORIGINS || "").split(",").filter(Boolean);
    if (
      !origins.length ||
      origins.some((value) => new URL(value).protocol !== "https:")
    )
      throw new Error("Production requires explicit HTTPS CORS_ORIGINS.");
  }
}
