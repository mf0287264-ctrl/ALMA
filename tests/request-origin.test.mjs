import test from "node:test";
import assert from "node:assert/strict";
import { allowedRequestOrigin, frontendRequestOrigin, secureAuthCookies } from "../alma_frontend/src/lib/request-security.ts";

function configure(t, mode, url) {
  const previousMode = process.env.NODE_ENV;
  const previousUrl = process.env.NEXTAUTH_URL;
  process.env.NODE_ENV = mode;
  if (url) process.env.NEXTAUTH_URL = url;
  else delete process.env.NEXTAUTH_URL;
  t.after(() => {
    if (previousMode === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = previousMode;
    if (previousUrl === undefined) delete process.env.NEXTAUTH_URL;
    else process.env.NEXTAUTH_URL = previousUrl;
  });
}

test("local forms work when Next normalizes a loopback request hostname", (t) => {
  configure(t, "development", "http://localhost:3000");
  for (const origin of [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://[::1]:3000",
  ]) {
    assert.equal(
      allowedRequestOrigin(origin, "http://localhost:3000/api/proxy/students"),
      true,
      origin,
    );
  }
});

test("local aliases require the same protocol and port", (t) => {
  configure(t, "development", "http://localhost:3000");
  for (const origin of [
    "http://127.0.0.1:3001",
    "https://127.0.0.1:3000",
    "http://localhost.attacker.example:3000",
    "http://192.168.1.10:3000",
    "https://attacker.example",
    "null",
    null,
  ]) {
    assert.equal(
      allowedRequestOrigin(origin, "http://localhost:3000/api/proxy/students"),
      false,
      String(origin),
    );
  }
});

test("a local server on a different port accepts its own browser origin", (t) => {
  configure(t, "development", "http://localhost:3000");
  assert.equal(
    allowedRequestOrigin(
      "http://127.0.0.1:3001",
      "http://localhost:3001/api/proxy/students",
    ),
    true,
  );
});

for (const mode of ["development", "production"]) {
  test(`a local ${mode} server uses the browser's host for network access`, (t) => {
    configure(t, mode, "http://localhost:3000");
    const request = new Request("http://localhost:3000/api/proxy/students", {
      headers: { host: "preview.example:3000", "x-forwarded-host": "other.example:3000" },
    });
    const origin = frontendRequestOrigin(request);
    assert.equal(origin, "http://preview.example:3000");
    assert.equal(allowedRequestOrigin("http://preview.example:3000", origin), true);
    assert.equal(allowedRequestOrigin("http://preview.example:3001", origin), false);
    assert.equal(allowedRequestOrigin("http://localhost:3000", origin), false);
    assert.equal(allowedRequestOrigin("http://other.example:3000", origin), false);
  });
}

test("production accepts only the configured origin", (t) => {
  configure(t, "production", "https://alma.example");
  const request = new Request("http://localhost:3000/api/proxy/students", {
    headers: { host: "preview.example:3000" },
  });
  assert.equal(frontendRequestOrigin(request), "https://alma.example");
  assert.equal(
    allowedRequestOrigin("https://alma.example", "http://localhost:3000/api/proxy/students"),
    true,
  );
  for (const origin of ["http://localhost:3000", "http://127.0.0.1:3000", "https://attacker.example"]) {
    assert.equal(
      allowedRequestOrigin(origin, "http://localhost:3000/api/proxy/students"),
      false,
      origin,
    );
  }
});

test("production without an explicit origin requires the exact request origin", (t) => {
  configure(t, "production");
  assert.equal(allowedRequestOrigin("https://alma.example", "https://alma.example/api/proxy/students"), true);
  assert.equal(allowedRequestOrigin("http://127.0.0.1:3000", "http://localhost:3000/api/proxy/students"), false);
});

test("explicit loopback production previews accept local aliases on the configured port", (t) => {
  configure(t, "production", "http://localhost:3000");
  const target = "http://localhost:3000/api/proxy/students";
  for (const origin of ["http://localhost:3000", "http://127.0.0.1:3000", "http://[::1]:3000"]) {
    assert.equal(allowedRequestOrigin(origin, target), true, origin);
  }
  for (const origin of ["http://127.0.0.1:3001", "https://127.0.0.1:3000", "https://attacker.example"]) {
    assert.equal(allowedRequestOrigin(origin, target), false, origin);
  }
});

test("local HTTP previews use cookies Safari can store, including production builds", (t) => {
  configure(t, "production", "http://localhost:3000");
  assert.equal(secureAuthCookies(), false);
  process.env.NEXTAUTH_URL = "http://127.0.0.1:3000";
  assert.equal(secureAuthCookies(), false);
});

test("HTTPS and public production sites always require secure cookies", (t) => {
  configure(t, "production", "https://alma.example");
  assert.equal(secureAuthCookies(), true);
  process.env.NEXTAUTH_URL = "http://alma.example";
  assert.equal(secureAuthCookies(), true);
  process.env.NEXTAUTH_URL = "ftp://localhost:3000";
  assert.equal(secureAuthCookies(), true);
  delete process.env.NEXTAUTH_URL;
  assert.equal(secureAuthCookies(), true);
});
