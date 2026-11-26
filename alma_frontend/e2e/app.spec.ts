import { test, expect, type Page } from "@playwright/test";
import { randomBytes } from "node:crypto";
import { readFile } from "node:fs/promises";
import { decode, encode } from "next-auth/jwt";

type Role = "student" | "teacher" | "parent";
const dashboards = { student: "/home", teacher: "/teacher/dashboard", parent: "/parent/dashboard" };

async function register(page: Page, role: Role) {
  const email = `browser-${role}-${randomBytes(8).toString("hex")}@example.test`;
  const password = randomBytes(20).toString("hex");
  await page.goto(role === "student" ? "/register" : `/register/${role}`, { waitUntil: "networkidle" });
  if (role === "teacher") {
    await page.getByLabel("First name", { exact: true }).fill("Browser");
    await page.getByLabel("Last name", { exact: true }).fill("Teacher");
  } else await page.getByLabel("Full name", { exact: true }).fill(`Browser ${role}`);
  await page.getByLabel("Email", { exact: true }).fill(email);
  await page.getByLabel("Password", { exact: true }).fill(password);
  await page.getByLabel("Confirm password", { exact: true }).fill(password);
  await page.locator('input[type="checkbox"]').last().check();
  await page.locator('button[type="submit"]').click();
  await page.waitForURL(`**${role === "student" ? "/register/step-2" : dashboards[role]}`);
  await page.waitForLoadState("networkidle");
  return { email, password };
}

async function assertLayout(page: Page) {
  const layout = await page.evaluate(() => ({
    viewport: innerWidth,
    width: document.documentElement.scrollWidth,
    font: getComputedStyle(document.body).fontFamily,
    stylesheets: Array.from(document.styleSheets).length,
  }));
  expect(layout.stylesheets).toBeGreaterThan(0);
  expect(layout.font).toMatch(/Arial|Helvetica|sans-serif/);
  expect(layout.width).toBeLessThanOrEqual(layout.viewport + 1);
}

async function logout(page: Page) {
  await page.getByRole("button", { name: "Log out", exact: true }).first().click();
  await page.waitForURL("**/welcome");
  await page.waitForLoadState("networkidle");
}

for (const width of [1440, 768, 390, 320]) {
  test(`public pages retain their styling at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const path of ["/", "/welcome", "/choose-role", "/login", "/forgot-password", "/register", "/register/teacher", "/register/parent", "/class-code"]) {
      await page.goto(path, { waitUntil: "networkidle" });
      await expect(page.locator("h1:visible, h2:visible").first()).toBeVisible();
      await assertLayout(page);
    }
  });
}

for (const role of ["student", "teacher", "parent"] as const) {
  test(`${role} can register, log out and sign in with browser autofill`, async ({ page }) => {
    const account = await register(page, role);
    const pages = role === "teacher"
      ? ["dashboard", "courses", "lessons", "groups", "students", "assessments", "achievements", "settings", "ai-generation"].map(path => `/teacher/${path}`)
      : role === "parent"
      ? ["dashboard", "children", "progress", "activity", "achievements", "reports", "contact", "feeds", "settings"].map(path => `/parent/${path}`)
      : ["/home"];
    for (const path of pages) {
      await page.goto(path, { waitUntil: "networkidle" });
      expect(new URL(page.url()).pathname).toBe(path);
      await assertLayout(page);
    }
    let session = await (await page.request.get("/api/auth/session")).json();
    expect(session.role).toBe(role);
    expect(session.error).toBeUndefined();
    expect(session.accessToken).toBeUndefined();
    expect(session.refreshToken).toBeUndefined();
    expect(new Date(session.expires).getTime() - Date.now()).toBeGreaterThan(29 * 86400_000);
    const origin = new URL(page.url()).origin;
    await logout(page);
    expect(new URL(page.url()).origin).toBe(origin);
    await page.goto(dashboards[role]);
    await page.waitForURL("**/login?**");
    await page.getByLabel(/Email/).fill(account.email);
    await page.getByLabel("Password", { exact: true }).fill("incorrect-password");
    await page.locator('button[type="submit"]').click();
    await expect(page.locator("form").getByRole("alert")).toContainText("Email or password is incorrect");
    // Password managers can fill native values without updating React state.
    await page.evaluate(({ email, password }) => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")!.set!;
      setter.call(document.querySelector('[name="email"]'), email);
      setter.call(document.querySelector('[name="password"]'), password);
    }, account);
    await page.getByRole("button", { name: "Show password", exact: true }).click();
    await expect(page.getByLabel("Password", { exact: true })).toHaveValue(account.password);
    await page.getByRole("button", { name: "Hide password", exact: true }).click();
    await page.locator('button[type="submit"]').click();
    await page.waitForURL(`**${dashboards[role]}`);
    await page.waitForLoadState("networkidle");
    session = await (await page.request.get("/api/auth/session")).json();
    expect(session.role).toBe(role);
    expect(session.error).toBeUndefined();
    const remaining = new Date(session.expires).getTime() - Date.now();
    expect(remaining).toBeGreaterThan(23 * 3600_000);
    expect(remaining).toBeLessThan(25 * 3600_000);
    await page.reload({ waitUntil: "networkidle" });
    expect(new URL(page.url()).pathname).toBe(dashboards[role]);
    await page.setViewportSize({ width: 390, height: 844 });
    await assertLayout(page);
    const toggle = page.getByRole("button", { name: "Toggle Navigation", exact: true });
    await toggle.click();
    await expect(page.getByRole("dialog", { name: `${role[0].toUpperCase()}${role.slice(1)} navigation` })).toBeVisible();
    await expect(page.locator("body")).toHaveCSS("overflow", "hidden");
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
    await expect(toggle).toBeFocused();
  });
}

test("student navigation and app pages work without overflow", async ({ page }) => {
  await register(page, "student");
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  for (const path of ["/home", "/courses", "/my-lessons", "/assessments", "/quize", "/ai-lesson", "/compete", "/achievements", "/profile", "/teachers", "/friends", "/feeds", "/messages"]) {
    await page.goto(path, { waitUntil: "networkidle" });
    expect(new URL(page.url()).pathname).toBe(path);
    await assertLayout(page);
  }
  expect(errors).toEqual([]);
  await page.goto("/home", { waitUntil: "networkidle" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.getByRole("button", { name: "Collapse sidebar", exact: true }).click();
  await expect(page.locator("aside")).toHaveCSS("width", "80px");
  await page.reload({ waitUntil: "networkidle" });
  await expect(page.locator("aside")).toHaveCSS("width", "80px");
  await page.getByRole("button", { name: "Expand sidebar", exact: true }).click();
  await page.getByTitle("Friends & Requests").click();
  const popover = page.getByRole("dialog", { name: "Friends and requests" });
  await expect(popover).toBeVisible();
  const bounds = await popover.boundingBox();
  expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(1440);
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 390, height: 844 });
  await page.getByRole("button", { name: "Toggle Navigation" }).click();
  await page.getByRole("dialog").getByRole("link", { name: "Courses", exact: true }).click();
  await page.waitForURL("**/courses");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await assertLayout(page);
});

test("full class codes join a real class and invalid codes show an error", async ({ page }) => {
  const teacher = await register(page, "teacher");
  const teacherSession = await (await page.request.get("/api/auth/session")).json();
  const fixture = JSON.parse(await readFile(process.env.ALMA_E2E_FIXTURE_PATH!, "utf8"));
  const approval = await page.request.post("http://127.0.0.1:5100/api/v1/admins/teacher-approvals", {
    headers: { Authorization: `Bearer ${fixture.administratorAccessToken}` },
    data: { teacher_id: teacherSession.backendId },
  });
  expect(approval.ok()).toBeTruthy();
  await logout(page);
  await page.goto("/login?role=teacher", { waitUntil: "networkidle" });
  await page.getByLabel(/Email/).fill(teacher.email);
  await page.getByLabel("Password", { exact: true }).fill(teacher.password);
  await page.locator('button[type="submit"]').click();
  await page.waitForURL("**/teacher/dashboard");
  const response = await page.request.post("/api/proxy/teacher-groups", {
    headers: { origin: new URL(page.url()).origin },
    data: { name: "Browser test class", subject: "Python", grade_level: "Grade 8" },
  });
  expect(response.ok(), `Class creation returned ${response.status()}`).toBeTruthy();
  const { data: group } = await response.json();
  expect(group.class_code.length).toBeGreaterThan(6);
  await logout(page);
  await register(page, "student");
  await page.goto("/class-code", { waitUntil: "networkidle" });
  await page.getByLabel("Class code", { exact: true }).fill("ALMA-INVALID");
  await page.getByRole("button", { name: "Join class", exact: true }).click();
  await expect(page.locator("form").getByRole("alert")).toContainText("No class found");
  await page.getByLabel("Class code", { exact: true }).fill(group.class_code);
  await page.getByRole("button", { name: "Join class", exact: true }).click();
  await page.waitForURL("**/teachers?group=**");
  await expect(page.getByText("Browser test class").first()).toBeVisible();
  const membership = await (await page.request.get("/api/proxy/teacher-groups/my-groups")).json();
  expect(membership.data.some((joined: { _id: string }) => joined._id === group._id)).toBeTruthy();
});

test("expired access tokens refresh during parallel authenticated requests", async ({ page, context }) => {
  await register(page, "student");
  const cookie = (await context.cookies()).find(item => item.name === "next-auth.session-token")!;
  const secret = process.env.ALMA_E2E_AUTH_SECRET!;
  const token = (await decode({ token: cookie.value, secret }))!;
  token.accessTokenExpires = Date.now() - 1000;
  await context.addCookies([{ ...cookie, value: await encode({ token, secret, maxAge: 86400 }) }]);
  const responses = await Promise.all(Array.from({ length: 3 }, () => page.request.get("/api/proxy/students/profile")));
  expect(responses.map(response => response.status())).toEqual([200, 200, 200]);
  await page.goto("/home", { waitUntil: "networkidle" });
  expect(new URL(page.url()).pathname).toBe("/home");
  const session = await (await page.request.get("/api/auth/session")).json();
  expect(session.error).toBeUndefined();
});

test("student onboarding saves preferences and a real profile avatar", async ({ page }) => {
  await register(page, "student");
  await page.getByRole("button", { name: "Continue", exact: true }).click();
  await page.waitForURL("**/register/step-3");
  await page.locator('button[type="submit"]').click();
  await page.waitForURL("**/home");
  const profile = await (await page.request.get("/api/proxy/students/profile")).json();
  expect(profile.data.age_group).toBe("13 to 15");
  expect(profile.data.profile_image).toMatch(/\.png$/);
});
