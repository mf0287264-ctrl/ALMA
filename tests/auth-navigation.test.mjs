import test from "node:test";
import assert from "node:assert/strict";
import { isProtectedPage, loginDestination, loginPath } from "../alma_frontend/src/lib/auth-routes.ts";

test("sign-in preserves the requested page and query for the correct role", () => {
  assert.equal(loginDestination("student", "/courses/123?tab=lessons"), "/courses/123?tab=lessons");
  assert.equal(loginDestination("teacher", "/teacher/groups?class=123"), "/teacher/groups?class=123");
  assert.equal(loginDestination("parent", "/parent/children"), "/parent/children");
  assert.equal(loginDestination("student", "/class-code?code=ALMA-123"), "/class-code?code=ALMA-123");
});

test("callbacks cannot redirect outside the app or back into sign-in", () => {
  for (const callback of [null, "", "/", "/login", "/login?callbackUrl=/home", "/welcome", "/register", "/unknown", "https://attacker.example", "//attacker.example/home", "/\\attacker.example", "/courses/../login"]) {
    assert.equal(loginDestination("student", callback), "/home", String(callback));
  }
});

test("sign-in respects role boundaries", () => {
  assert.equal(loginDestination("student", "/teacher/dashboard"), "/home");
  assert.equal(loginDestination("student", "/parent/dashboard"), "/home");
  assert.equal(loginDestination("teacher", "/parent/children"), "/teacher/dashboard");
  assert.equal(loginDestination("parent", "/teacher/groups"), "/parent/dashboard");
  assert.equal(loginDestination("teacher", "/home"), "/teacher/dashboard");
  assert.equal(loginDestination("parent", "/class-code"), "/parent/dashboard");
  assert.equal(loginDestination("student", "/admin"), "/home");
});

test("login redirects include the role and the complete destination", () => {
  const url = new URL(loginPath("/teacher/groups?tab=students"), "http://localhost:3000");
  assert.equal(url.pathname, "/login");
  assert.equal(url.searchParams.get("role"), "teacher");
  assert.equal(url.searchParams.get("callbackUrl"), "/teacher/groups?tab=students");
});

test("onboarding steps and nested app pages are protected", () => {
  assert.equal(isProtectedPage("/register/step-2"), true);
  assert.equal(isProtectedPage("/register/step-3"), true);
  assert.equal(isProtectedPage("/my-lessons/player"), true);
  assert.equal(isProtectedPage("/register"), false);
  assert.equal(isProtectedPage("/teacher-public"), false);
});
