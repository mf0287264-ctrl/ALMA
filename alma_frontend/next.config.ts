import type { NextConfig } from "next";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";

// Sonner inserts its package stylesheet without a nonce. Authorize only that exact CSS.
const configRequire = createRequire(`${process.cwd()}/package.json`);
const sonnerSource = readFileSync(configRequire.resolve("sonner"), "utf8");
const insertedStyle = sonnerSource
  .split("\n")
  .find((line) => line.startsWith("__insertCSS("));
if (!insertedStyle)
  throw new Error("Verify Sonner's stylesheet integration before building.");
const sonnerCss: string = JSON.parse(
  insertedStyle.slice("__insertCSS(".length, -2),
);
const sonnerStyleHash = createHash("sha256").update(sonnerCss).digest("base64");

const nextConfig: NextConfig = {
  env: { SONNER_CSP_STYLE_HASH: sonnerStyleHash },
  poweredByHeader: false,
  experimental: {
    agentFeedback: true,
    cpus: 4,
  },
  // Strict per-request script nonces require dynamic rendering; cached shells cannot reuse a nonce.
  cacheComponents: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
