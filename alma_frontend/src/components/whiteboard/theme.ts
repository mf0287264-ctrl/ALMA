/**
 * Whiteboard theme: the ONLY place where board colors and fonts live.
 * Values come from the ALMA student pages (cream background, dark teal ink,
 * mango accent). Change them here and every scene follows.
 */

export const BOARD = { width: 800, height: 500 } as const;

export const COLORS = {
  ink: "#10292e", // main text and strokes
  muted: "#607274",
  faint: "#8a999b",
  paper: "#ffffff", // board surface
  grid: "#eef2ef",
  line: "#e8eeea", // card borders
  cream: "#fff8ec", // page background
  mango: "#ffa11f", // brand accent
  mangoSoft: "#fff3db",
  mangoLine: "#fae2b8",
  teal: "#118a80",
  tealSoft: "#e6f5f2",
  tealLine: "#d2ede7",
  blue: "#2b88d8",
  blueSoft: "#e9f4fb",
  pink: "#f25c78",
  pinkSoft: "#fff0f3",
  pinkLine: "#f4c8ce",
  code: "#0b1a1c", // code card background (same as the lesson player)
  codeText: "#e9f1ee",
  codeLine: "#1b3438",
  codeGreen: "#a4efb3",
} as const;

/** Accent colors used when a scene does not choose its own. */
export const ACCENTS = [COLORS.mango, COLORS.teal, COLORS.blue, COLORS.pink];

export const FONT = {
  sans: "inherit",
  mono: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace",
} as const;

/** Soft shadow used on cards and boxes (CSS filter, works on SVG elements). */
export const SHADOW = "drop-shadow(0 2px 5px rgba(16, 41, 46, 0.14))";
