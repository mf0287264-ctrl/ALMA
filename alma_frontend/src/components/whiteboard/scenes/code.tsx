/**
 * Code figures: a code block with Python colors (draw_code_block), a
 * before/after comparison (draw_code_diff) and side-by-side snippets
 * (draw_language_showcase). All three share one CodePanel.
 */

import type { CodeBlockPayload, SceneProps } from "@/types/Whiteboard.type";
import { COLORS, FONT } from "../theme";
import { MONO_WIDTH, useShadowFilter, arr, num, point, stagger, str } from "./helpers";

/* -------------------------------------------------------------- coloring */

const KEYWORDS = new Set(
  ("False None True and as assert async await break class continue def del elif else except finally for " +
    "from global if import in is lambda nonlocal not or pass raise return try while with yield").split(" "),
);
const BUILTINS = new Set(
  ("print range len int str float bool input list dict set tuple type sum min max abs round sorted " +
    "enumerate zip open reversed isinstance").split(" "),
);

const SYNTAX = {
  text: COLORS.codeText,
  keyword: COLORS.mango,
  builtin: "#64b5f6",
  string: COLORS.codeGreen,
  number: "#f6a6b8",
  comment: "#6f8a8d",
  name: "#ffd479",
};

// comment | string | number | word | anything else (one character at a time)
const TOKEN = /(#.*$)|((?:[rbfRBF]{0,2})(?:"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'))|(\d+(?:\.\d+)?)|([A-Za-z_]\w*)|([\s\S])/g;

interface Token {
  text: string;
  color: string;
}

/** Splits one line of code into colored pieces. */
function tokenize(line: string): Token[] {
  const tokens: Token[] = [];
  let namesNext = false; // the word after `def` / `class` is a name

  const push = (text: string, color: string) => {
    const last = tokens[tokens.length - 1];
    if (last && last.color === color) last.text += text;
    else tokens.push({ text, color });
  };

  for (const match of line.matchAll(TOKEN)) {
    const [text, comment, string, number, word] = match;
    if (comment) push(text, SYNTAX.comment);
    else if (string) push(text, SYNTAX.string);
    else if (number) push(text, SYNTAX.number);
    else if (word) {
      if (namesNext) push(text, SYNTAX.name);
      else if (KEYWORDS.has(word)) push(text, SYNTAX.keyword);
      else if (BUILTINS.has(word)) push(text, SYNTAX.builtin);
      else push(text, SYNTAX.text);
      namesNext = word === "def" || word === "class";
    } else {
      push(text, SYNTAX.text);
      if (text.trim()) namesNext = false;
    }
  }
  return tokens;
}

/* ----------------------------------------------------------------- panel */

interface CodePanelProps {
  id: string;
  x: number;
  y: number;
  width: number;
  height?: number;
  title: string;
  badge?: string;
  lines: string[];
  /** 1-based line numbers drawn with a highlight band */
  highlight?: number[];
  /** 1-based line shown as the line being explained */
  active?: number;
  /** lines of the output area under the code */
  terminal?: string[];
  /** "+" / "-" shown instead of line numbers (diff view) */
  marker?: "+" | "-";
  /** Terminal-style text without syntax colors or line numbers (program output) */
  plain?: boolean;
  /** 1-based first line that animates in; earlier lines are already on the board (append mode) */
  revealFrom?: number;
  size?: number;
}

function CodePanel({
  id,
  x,
  y,
  width,
  height = 0,
  title,
  badge,
  lines,
  highlight = [],
  active,
  terminal = [],
  marker,
  plain = false,
  revealFrom = 1,
  size = 15,
}: CodePanelProps) {
  const shadow = useShadowFilter();
  const lineH = size * 1.62;
  const headerH = 34;
  const pad = 12;
  const gutter = plain ? 16 : 40;
  const terminalH = terminal.length ? 34 + terminal.length * 18 : 0;
  const h = Math.max(height, headerH + pad * 2 + lines.length * lineH + terminalH);
  const codeBottom = y + h - terminalH;
  const clipId = `code-${id.replace(/[^\w-]/g, "")}`;
  const markerColor = marker === "+" ? COLORS.teal : COLORS.pink;

  return (
    <g>
      <rect x={x} y={y} width={width} height={h} rx={14} fill={COLORS.code} filter={shadow} />
      <clipPath id={clipId}>
        <rect x={x} y={y} width={width} height={h} rx={14} />
      </clipPath>

      <g clipPath={`url(#${clipId})`}>
        {/* window bar */}
        <rect x={x} y={y} width={width} height={headerH} fill="#12292c" />
        {[COLORS.pink, COLORS.mango, COLORS.teal].map((color, i) => (
          <circle key={i} cx={x + 18 + i * 15} cy={y + headerH / 2} r={4.5} fill={color} />
        ))}
        <text x={x + 74} y={y + headerH / 2 + 4} fontSize={11} fontFamily={FONT.mono} fill="#8fb3b0">
          {title}
        </text>
        {badge && (
          <text x={x + width - 14} y={y + headerH / 2 + 4} textAnchor="end" fontSize={10} fontFamily={FONT.mono} fill={COLORS.mango}>
            {badge}
          </text>
        )}

        {/* code */}
        {lines.map((line, i) => {
          const number = i + 1;
          const top = y + headerH + pad + i * lineH;
          const marked = highlight.includes(number) || active === number;
          const animated = number >= revealFrom;
          return (
            <g
              key={i}
              className={animated ? "wb-slide" : undefined}
              style={animated ? stagger(number - revealFrom, plain ? 320 : 110) : undefined}
            >
              {marked && (
                <>
                  <rect x={x} y={top - 2} width={width} height={lineH} fill={marker ? markerColor : COLORS.mango} fillOpacity={active === number ? 0.22 : 0.13} />
                  <rect x={x} y={top - 2} width={3} height={lineH} fill={marker ? markerColor : COLORS.mango} />
                </>
              )}
              {!plain && (
                <text x={x + gutter - 12} y={top + size} textAnchor="end" fontSize={size - 3} fontFamily={FONT.mono} fill={marker ? markerColor : "#58757a"}>
                  {marker ?? number}
                </text>
              )}
              <text x={x + gutter + 4} y={top + size} fontSize={size} fontFamily={FONT.mono} xmlSpace="preserve" style={{ whiteSpace: "pre" }}>
                {(plain ? [{ text: line, color: COLORS.codeGreen }] : tokenize(line)).map((token, t) => (
                  <tspan key={t} fill={token.color}>
                    {token.text}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}

        {/* output */}
        {terminal.length > 0 && (
          <g>
            <rect x={x} y={codeBottom} width={width} height={terminalH} fill="#071213" />
            <line x1={x} x2={x + width} y1={codeBottom} y2={codeBottom} stroke={COLORS.codeLine} />
            <text x={x + 14} y={codeBottom + 20} fontSize={10} fontWeight={700} letterSpacing={1.2} fill="#58757a">
              OUTPUT
            </text>
            {terminal.map((line, i) => (
              <text key={i} x={x + 14} y={codeBottom + 40 + i * 18} fontSize={12} fontFamily={FONT.mono} xmlSpace="preserve" style={{ whiteSpace: "pre" }} fill={line.startsWith("$") ? "#8fb3b0" : COLORS.codeGreen}>
                {line}
              </text>
            ))}
          </g>
        )}
      </g>
    </g>
  );
}

/** Width that fits the longest line (monospace), within the board. */
const fitWidth = (lines: string[], size: number, min = 240, max = 740) =>
  Math.min(max, Math.max(min, Math.max(...lines.map((line) => line.length), 8) * size * MONO_WIDTH + 60));

/* ---------------------------------------------------------------- scenes */

/** draw_code_block */
export function DrawCodeBlock({ id, p }: SceneProps) {
  const payload = p as unknown as Partial<CodeBlockPayload>;
  const [x, y] = point(payload.position, [num(p.x, 50), num(p.y, 50)]);
  const all = str(payload.code).replace(/\s+$/, "").split("\n");
  const lines = all.slice(0, Math.max(1, num(payload.visible_lines, all.length)));
  const language = str(payload.language, "python");
  const output = str(payload.output);
  const terminal = [
    ...(payload.command ? [`$ ${payload.command}`] : []),
    ...(output ? output.split("\n") : []),
  ].slice(0, 6);

  return (
    <CodePanel
      id={id}
      x={x}
      y={y}
      width={num(payload.width, fitWidth(lines, 15, 300, 520))}
      height={num(payload.height)}
      title={str(payload.title, language === "python" ? "main.py" : `main.${language}`)}
      badge={language}
      lines={lines}
      highlight={arr<number>(payload.highlight_lines)}
      active={payload.active_line}
      terminal={terminal}
      plain={["text", "output", "console"].includes(language)}
      revealFrom={p.append ? num(p.reveal_from, 1) : 1}
    />
  );
}

/** draw_code_diff: { old_code, new_code, position } */
export function DrawCodeDiff({ id, p }: SceneProps) {
  const [x, y] = point(p.position, [30, 70]);
  const gap = 16;
  const width = (800 - x * 2 - gap) / 2;
  const before = str(p.old_code).split("\n");
  const after = str(p.new_code).split("\n");
  const all = (lines: string[]) => lines.map((_, i) => i + 1);

  return (
    <g>
      <CodePanel id={`${id}-old`} x={x} y={y} width={width} title="Before" lines={before} highlight={all(before)} marker="-" size={12} />
      <CodePanel id={`${id}-new`} x={x + width + gap} y={y} width={width} title="After" lines={after} highlight={all(after)} marker="+" size={12} />
    </g>
  );
}

/** draw_language_showcase: { snippets: [{ name, code }], position } */
export function DrawLanguageShowcase({ id, p }: SceneProps) {
  const [x, y] = point(p.position, [30, 70]);
  const snippets = arr<{ name?: unknown; code?: unknown }>(p.snippets).slice(0, 3);
  const gap = 14;
  const width = (800 - x * 2 - gap * (snippets.length - 1)) / Math.max(snippets.length, 1);

  return (
    <g>
      {snippets.map((snippet, i) => (
        <g key={i} className="wb-item" style={{ ["--d" as string]: `${i * 140}ms` }}>
          <CodePanel
            id={`${id}-${i}`}
            x={x + i * (width + gap)}
            y={y}
            width={width}
            title={str(snippet.name, `snippet ${i + 1}`)}
            lines={str(snippet.code).split("\n")}
            size={12}
          />
        </g>
      ))}
    </g>
  );
}
