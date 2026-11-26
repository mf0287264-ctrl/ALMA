export const protectedPages = [
  "/home", "/profile", "/learn", "/lesson", "/my-lessons", "/courses",
  "/assessments", "/compete", "/quize", "/ai-lesson", "/achievements",
  "/teachers", "/teacher", "/parent", "/feeds", "/feed", "/friends",
  "/messages", "/admin", "/register/step-2", "/register/step-3",
];

export const under = (path: string, prefix: string) =>
  path === prefix || path.startsWith(`${prefix}/`);

export const isProtectedPage = (path: string) =>
  protectedPages.some((prefix) => under(path, prefix));

export function dashboardPath(role?: string | null): string {
  if (role === "teacher") return "/teacher/dashboard";
  if (role === "parent") return "/parent/dashboard";
  return "/home";
}

/** Keep a requested page after sign-in without allowing redirect loops or external URLs. */
export function loginDestination(role?: string | null, callbackUrl?: string | null): string {
  const fallback = dashboardPath(role);
  if (!callbackUrl?.startsWith("/") || callbackUrl.startsWith("//") || callbackUrl.includes("\\")) return fallback;
  try {
    const target = new URL(callbackUrl, "https://alma.invalid");
    const path = target.pathname;
    if (target.origin !== "https://alma.invalid" || (!isProtectedPage(path) && path !== "/class-code")) return fallback;
    if (under(path, "/teacher") && !["teacher", "admin"].includes(role || "")) return fallback;
    if (under(path, "/parent") && !["parent", "admin"].includes(role || "")) return fallback;
    if (under(path, "/admin") && role !== "admin") return fallback;
    if (role !== "student" && (path === "/home" || path === "/class-code" || under(path, "/register"))) return fallback;
    return `${path}${target.search}${target.hash}`;
  } catch {
    return fallback;
  }
}

export function loginPath(callbackUrl: string): string {
  const path = callbackUrl.split("?")[0];
  const query = new URLSearchParams({ callbackUrl });
  if (under(path, "/teacher")) query.set("role", "teacher");
  else if (under(path, "/parent")) query.set("role", "parent");
  return `/login?${query}`;
}
