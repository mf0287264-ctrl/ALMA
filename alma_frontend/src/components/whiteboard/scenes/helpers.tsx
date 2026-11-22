import { createContext, useContext, type CSSProperties, type ReactNode } from "react";
import type { Payload, Point } from "@/types/Whiteboard.type";
import { COLORS, FONT } from "../theme";

/* ---------------------------------------------------------------------------
 * Safe readers. Scene payloads are JSON from the database, so every renderer
 * reads its fields through these and falls back to a default instead of
 * crashing on a missing or malformed value.
 * ------------------------------------------------------------------------ */

export const num = (v: unknown, fallback = 0): number =>
  typeof v === "number" && Number.isFinite(v) ? v : fallback;

export const str = (v: unknown, fallback = ""): string =>
  typeof v === "string" ? v : v == null ? fallback : String(v);

export const arr = <T,>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);

export const point = (v: unknown, fallback: Point): Point =>
  Array.isArray(v) && v.length >= 2 ? [num(v[0], fallback[0]), num(v[1], fallback[1])] : fallback;

/** The optional `style` object of a payload (empty when missing). */
export const styleOf = <T extends object>(p: Payload): Partial<T> =>
  p.style && typeof p.style === "object" ? (p.style as Partial<T>) : {};

export const ellipsize = (text: string, max: number) =>
  text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;

/* ---------------------------------------------------------------------------
 * Text. SVG has no automatic wrapping, so lines are estimated from the
 * average glyph width (a fraction of the font size).
 * ------------------------------------------------------------------------ */

export const CHAR_WIDTH = 0.56;
export const MONO_WIDTH = 0.6;

export const textWidth = (text: string, size: number, charWidth = CHAR_WIDTH) =>
  text.length * size * charWidth;

/** Splits text into lines that fit `maxWidth`. Honors "\n" and adds "…" when cut. */
export function wrapLines(
  text: string,
  maxWidth: number,
  size: number,
  maxLines = 99,
  charWidth = CHAR_WIDTH,
): string[] {
  const perLine = Math.max(1, Math.floor(Math.max(1, maxWidth) / (Math.max(1, size) * charWidth)));
  maxLines = Math.max(1, Math.floor(maxLines));
  const lines: string[] = [];

  for (const paragraph of text.split("\n")) {
    let current = "";
    for (const word of paragraph.split(/\s+/).filter(Boolean)) {
      if (word.length > perLine) {
        if (current) lines.push(current);
        for (let offset = 0; offset < word.length; offset += perLine) {
          const chunk = word.slice(offset, offset + perLine);
          if (offset + perLine < word.length) lines.push(chunk);
          else current = chunk;
        }
        continue;
      }
      const next = current ? `${current} ${word}` : word;
      if (next.length > perLine && current) {
        lines.push(current);
        current = word;
      } else {
        current = next;
      }
    }
    lines.push(current);
  }

  if (lines.length <= maxLines) return lines;
  const kept = lines.slice(0, maxLines);
  kept[maxLines - 1] = `${kept[maxLines - 1].slice(0, Math.max(1, perLine - 1)).trimEnd()}…`;
  return kept;
}

interface TextBlockProps {
  lines: string[];
  x: number;
  y: number; // baseline of the first line
  size: number;
  color?: string;
  weight?: string | number;
  anchor?: "start" | "middle" | "end";
  lineHeight?: number;
  mono?: boolean;
  italic?: boolean;
}

/** Multi-line SVG text. */
export function TextBlock({
  lines,
  x,
  y,
  size,
  color = COLORS.ink,
  weight = 600,
  anchor = "start",
  lineHeight = 1.3,
  mono = false,
  italic = false,
}: TextBlockProps) {
  return (
    <text
      className="wb-label"
      x={x}
      y={y}
      fontSize={size}
      fill={color}
      fontWeight={weight}
      textAnchor={anchor}
      fontStyle={italic ? "italic" : "normal"}
      fontFamily={mono ? FONT.mono : FONT.sans}
      style={mono ? { whiteSpace: "pre" } : undefined}
    >
      {lines.map((line, i) => (
        <tspan key={i} x={x} dy={i === 0 ? 0 : size * lineHeight}>
          {line}
        </tspan>
      ))}
    </text>
  );
}

interface CenteredLabelProps {
  cx: number;
  cy: number;
  text: string;
  maxWidth: number;
  size?: number;
  color?: string;
  weight?: string | number;
  maxLines?: number;
  mono?: boolean;
}

/** Wrapped text centered on a point (inside a box, circle, badge...). */
export function CenteredLabel({
  cx,
  cy,
  text,
  maxWidth,
  size = 14,
  color = COLORS.ink,
  weight = 700,
  maxLines = 3,
  mono = false,
}: CenteredLabelProps) {
  const lines = wrapLines(text, maxWidth, size, maxLines, mono ? MONO_WIDTH : CHAR_WIDTH);
  const lineHeight = 1.25;
  const firstBaseline = cy - ((lines.length - 1) * size * lineHeight) / 2 + size * 0.34;
  return (
    <TextBlock
      lines={lines}
      x={cx}
      y={firstBaseline}
      size={size}
      color={color}
      weight={weight}
      anchor="middle"
      lineHeight={lineHeight}
      mono={mono}
    />
  );
}

/* ---------------------------------------------------------------------------
 * Colors
 * ------------------------------------------------------------------------ */

/** True for dark hex colors, so text on top can switch to white. */
export function isDark(color: string): boolean {
  const hex = color.trim().replace("#", "");
  const full =
    hex.length === 3
      ? hex
          .split("")
          .map((c) => c + c)
          .join("")
      : hex;
  if (!/^[0-9a-f]{6}$/i.test(full)) return false;
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16));
  return (r * 299 + g * 587 + b * 114) / 1000 < 140;
}

/** Ink or white, whichever reads better on `fill`. */
export const readableOn = (fill: string) => (fill === "none" || !isDark(fill) ? COLORS.ink : "#ffffff");

/* ---------------------------------------------------------------------------
 * Small shared shapes
 * ------------------------------------------------------------------------ */

/** Arrow tip pointing from `from` toward `to`. Fades in after the line is drawn. */
export function Arrowhead({
  from,
  to,
  color,
  size = 11,
}: {
  from: Point;
  to: Point;
  color: string;
  size?: number;
}): ReactNode {
  const angle = Math.atan2(to[1] - from[1], to[0] - from[0]);
  const spread = Math.PI / 7;
  const left: Point = [to[0] - size * Math.cos(angle - spread), to[1] - size * Math.sin(angle - spread)];
  const right: Point = [to[0] - size * Math.cos(angle + spread), to[1] - size * Math.sin(angle + spread)];
  return (
    <polygon
      className="wb-head"
      points={`${to[0]},${to[1]} ${left[0]},${left[1]} ${right[0]},${right[1]}`}
      fill={color}
    />
  );
}

/** Straight connector between two points, with an optional arrow tip. */
export function Connector({
  from,
  to,
  color = COLORS.muted,
  width = 2,
  arrow = true,
  dashed = false,
}: {
  from: Point;
  to: Point;
  color?: string;
  width?: number;
  arrow?: boolean;
  dashed?: boolean;
}) {
  // Stop the line short of the tip so the stroke does not poke through the head.
  const length = Math.hypot(to[0] - from[0], to[1] - from[1]) || 1;
  const inset = arrow ? Math.min(8, length * 0.5) : 0;
  const end: Point = [to[0] - ((to[0] - from[0]) / length) * inset, to[1] - ((to[1] - from[1]) / length) * inset];
  return (
    <g>
      <line
        x1={from[0]}
        y1={from[1]}
        x2={end[0]}
        y2={end[1]}
        stroke={color}
        strokeWidth={width}
        strokeLinecap="round"
        pathLength={dashed ? undefined : 1}
        strokeDasharray={dashed ? "6 5" : undefined}
        className={dashed ? "wb-fade" : "wb-stroke"}
      />
      {arrow && <Arrowhead from={from} to={to} color={color} size={5 + width * 2.2} />}
    </g>
  );
}

/** Drop shadow reference (the filter itself is defined once in Whiteboard.tsx). */
export const SceneScope = createContext("wb");
export const useShadowFilter = () => `url(#${useContext(SceneScope)}-shadow)`;

/** Inline style that delays a `.wb-item` / `.wb-slide` / `.wb-grow` animation by `index` steps. */
export const stagger = (index: number, stepMs = 90): CSSProperties =>
  ({ "--d": `${index * stepMs}ms` }) as CSSProperties;
