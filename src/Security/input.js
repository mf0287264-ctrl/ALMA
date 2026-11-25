const reserved = new Set(["__proto__", "prototype", "constructor"]);
const protectedAccountFields = new Set([
  "_id",
  "role",
  "permissions",
  "password_hash",
  "is_active",
  "xp",
  "current_streak",
  "longest_streak",
  "lessons_completed",
  "completed_lessons",
  "completed_courses",
  "achievements",
  "enrolled_courses",
  "teacher_id",
  "parent_id",
  "children",
  "following",
  "followers",
  "friends",
  "friend_requests_sent",
  "friend_requests_received",
  "student_code",
  "teacher_code",
  "admin_code",
  "parent_code",
  "auth_version",
  "guardian_verified_at",
  "guardian_verified_by",
  "is_verified",
  "teacher_verified_at",
  "teacher_verified_by",
]);
const credentialFields = new Set([
  "accessToken",
  "refreshToken",
  "password",
  "password_hash",
  "refresh_hash",
  "api_key",
  "gemini_api_key",
  "geminiApiKey",
  "hf_api_token",
  "token_encryption_key",
]);

export const httpError = (statusCode, message) =>
  Object.assign(new Error(message), { statusCode });

export function inspectInput(value, { query = false } = {}) {
  let nodes = 0;
  function visit(input, depth = 0, mapping = false) {
    if (++nodes > 30000 || depth > 30)
      throw httpError(400, "The request is too complex.");
    if (typeof input === "string" && input.length > 100000)
      throw httpError(400, "A request field is too long.");
    if (Array.isArray(input)) {
      if (input.length > (query ? 100 : 5000))
        throw httpError(400, "A request collection is too large.");
      input.forEach((item) => visit(item, depth + 1));
    } else if (input && typeof input === "object") {
      for (const [key, child] of Object.entries(input)) {
        if (
          (!mapping && reserved.has(key)) ||
          (!mapping && (key.startsWith("$") || key.includes(".")))
        )
          throw httpError(
            400,
            "Database operators and reserved property names are not allowed.",
          );
        if (mapping && typeof child !== "string")
          throw httpError(400, "Feedback mappings must contain text values.");
        if (query && typeof child !== "string")
          throw httpError(400, "Query parameters must be single text values.");
        visit(child, depth + 1, ["misconception_map"].includes(key));
      }
    }
  }
  visit(value);
}

export function validateRequestInput(req, res, next) {
  try {
    inspectInput(req.body);
    inspectInput(req.query, { query: true });
    next();
  } catch (error) {
    next(error);
  }
}

export function protectAccountInput(req) {
  if (
    !["POST", "PUT", "PATCH"].includes(req.method) ||
    !/^\/(students|teachers|parents|admins)(?:\/|$)/.test(req.path) ||
    /\/(?:login|friend-request|accept-friend-request|reject-friend-request|accept-friend|reject-friend|link-child|unlink-child|messages|guardian-links|teacher-approvals)(?:\/|$)/.test(
      req.path,
    )
  )
    return;
  const admin = req.authUser?.role === "admin";
  for (const key of Object.keys(req.body || {})) {
    if (
      protectedAccountFields.has(key) &&
      !(admin && ["is_active", "permissions"].includes(key))
    )
      throw httpError(400, "This account field is managed by the server.");
  }
}

export function sanitizeResponse(
  value,
  { stripTokens = false, publicProfiles = false, userId } = {},
) {
  if (value == null || typeof value !== "object") return value;
  if (typeof value.toJSON === "function")
    return sanitizeResponse(value.toJSON(), {
      stripTokens,
      publicProfiles,
      userId,
    });
  if (Array.isArray(value))
    return value.map((item) =>
      sanitizeResponse(item, { stripTokens, publicProfiles, userId }),
    );
  const account =
    publicProfiles &&
    ("student_code" in value ||
      "teacher_code" in value ||
      ("email" in value && "first_name" in value)) &&
    String(value._id) !== String(userId);
  const publicKeys = new Set([
    "_id",
    "name",
    "first_name",
    "last_name",
    "profile_image",
    "profileImage",
    "student_code",
    "teacher_code",
    "specialization",
    "school_name",
    "grade_level",
    "role",
  ]);
  return Object.fromEntries(
    Object.entries(value)
      .filter(
        ([key]) =>
          !reserved.has(key) &&
          (!account || publicKeys.has(key)) &&
          ![
            "password",
            "password_hash",
            "refresh_hash",
            "api_key",
            "gemini_api_key",
            "geminiApiKey",
            "hf_api_token",
            "token_encryption_key",
          ].includes(key) &&
          !(stripTokens && credentialFields.has(key)),
      )
      .map(([key, child]) => [
        key,
        sanitizeResponse(child, { stripTokens, publicProfiles, userId }),
      ]),
  );
}

export function protectResponse(req, res, next) {
  const send = res.json.bind(res);
  // Express changes req.path as nested routers run. Capture the original API path.
  const pathname = (req.originalUrl || req.path)
    .split("?")[0]
    .replace(/^\/api\/v1/, "");
  const credentials =
    req.method === "POST" &&
    (/^\/(students|teachers|parents|admins)(?:\/login)?\/?$/.test(pathname) ||
      pathname === "/auth/refresh-token");
  res.json = (value) =>
    send(
      sanitizeResponse(value, {
        stripTokens: !credentials,
        publicProfiles: req.publicProfiles === true,
        userId: req.authUser?._id,
      }),
    );
  next();
}

export const escapeSearch = (value) =>
  String(value)
    .slice(0, 100)
    .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
