import { createHmac, randomUUID } from "node:crypto";
import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import { MongoRateLimitStore } from "./rateLimitStore.js";
import { requiredSecret } from "./config.js";

export function requestSecurity(req, res, next) {
  req.requestId = randomUUID();
  res.setHeader("X-Request-ID", req.requestId);
  if (
    req.headers["content-encoding"] &&
    req.headers["content-encoding"] !== "identity"
  )
    return res
      .status(415)
      .json({ error: "Compressed request bodies are not accepted." });
  const length = Number(req.headers["content-length"] || 0);
  if (length > 5 * 1024 * 1024)
    return res.status(413).json({ error: "The request is too large." });
  next();
}

export function makeLimiter(
  prefix,
  windowMs,
  limit,
  {
    storeFactory = (name) => new MongoRateLimitStore(name),
    credentials = false,
    accountOnly = false,
  } = {},
) {
  return rateLimit({
    windowMs,
    limit,
    store: storeFactory(prefix),
    standardHeaders: "draft-8",
    legacyHeaders: false,
    passOnStoreError: false,
    keyGenerator(req) {
      const ip = ipKeyGenerator(req.ip || "127.0.0.1");
      const email =
        typeof req.body?.email === "string"
          ? req.body.email.toLowerCase().trim().slice(0, 254)
          : "";
      const identity =
        credentials && email
          ? accountOnly
            ? email
            : `${ip}:${email}`
          : req.authUser?._id
            ? String(req.authUser._id)
            : ip;
      return createHmac("sha256", requiredSecret("JWT_SECRET"))
        .update(identity)
        .digest("hex");
    },
    handler: (req, res) =>
      res
        .status(429)
        .json({
          success: false,
          error: "Too many requests. Please wait and try again.",
          request_id: req.requestId,
        }),
  });
}
