/**
 * Basic ink: text, boxes, circles, lines, arrows, paths, badges, callouts,
 * equations and highlights. Each renderer draws in board coordinates (800x500)
 * and only describes the final look. The entrance animation comes from the
 * wrapper in Whiteboard.tsx.
 */

import type {
  BadgePayload,
  CalloutPayload,
  CirclePayload,
  HighlightPayload,
  LinePayload,
  PathPayload,
  RectPayload,
  SceneProps,
  TextStyle,
} from "@/types/Whiteboard.type";
import { COLORS } from "../theme";
import {
  CenteredLabel,
  Connector,
  useShadowFilter,
  TextBlock,
  ellipsize,
  num,
  point,
  readableOn,
  str,
  styleOf,
  textWidth,
  wrapLines,
} from "./helpers";

/** draw_text, write_text */
export function DrawText({ p }: SceneProps) {
  const [x, y] = point(p.position, [100, 100]);
  const style = styleOf<TextStyle>(p);
  const size = num(style.fontSize, 22);
  const anchor = style.textAnchor ?? "start";
  const maxWidth = num(style.maxWidth, anchor === "middle" ? 640 : 780 - x);
  const lines = wrapLines(str(p.content), maxWidth, size, num(style.maxLines, 4));

  return (
    <TextBlock
      lines={lines}
      x={x}
      y={y}
      size={size}
      color={style.color ?? COLORS.ink}
      weight={style.fontWeight ?? 500}
      anchor={anchor}
      italic={style.fontStyle === "italic"}
    />
  );
}

/** draw_rect */
export function DrawRect({ p }: SceneProps) {
  const shadow = useShadowFilter();
  const style = styleOf<NonNullable<RectPayload["style"]>>(p);
  const [x, y, w, h] = [num(p.x, 100), num(p.y, 100), num(p.width, 150), num(p.height, 60)];
  const fill = style.fill ?? COLORS.paper;
  const label = str(p.label);

  return (
    <g>
      <rect
        className={style.flat ? "wb-fade" : "wb-outline"}
        pathLength={1}
        x={x}
        y={y}
        width={w}
        height={h}
        rx={num(style.rx, 10)}
        fill={fill}
        stroke={style.flat ? "none" : (style.stroke ?? COLORS.ink)}
        strokeWidth={num(style.strokeWidth, 2)}
        filter={style.flat ? undefined : shadow}
      />
      {label && (
        <CenteredLabel
          cx={x + w / 2}
          cy={y + h / 2}
          text={label}
          maxWidth={w - 16}
          size={num(style.fontSize, Math.min(15, Math.max(11, h * 0.3)))}
          weight={style.fontWeight ?? 700}
          color={readableOn(fill)}
          maxLines={Math.max(1, Math.floor((h - 10) / 18))}
          mono={style.mono}
        />
      )}
    </g>
  );
}

/** draw_circle */
export function DrawCircle({ p }: SceneProps) {
  const style = styleOf<NonNullable<CirclePayload["style"]>>(p);
  const [cx, cy] = point(p.center, [200, 200]);
  const r = num(p.radius, 40);
  const fill = style.fill ?? "none";
  const label = str(p.label);

  return (
    <g>
      <circle
        className="wb-outline"
        pathLength={1}
        cx={cx}
        cy={cy}
        r={Math.max(0, r)}
        fill={fill}
        stroke={style.stroke ?? COLORS.ink}
        strokeWidth={num(style.strokeWidth, 2)}
      />
      {label && (
        <CenteredLabel
          cx={cx}
          cy={cy}
          text={label}
          maxWidth={r * 1.5}
          size={Math.min(14, Math.max(11, r * 0.38))}
          color={readableOn(fill)}
        />
      )}
    </g>
  );
}

/** draw_arrow */
export function DrawArrow({ p }: SceneProps) {
  const style = styleOf<NonNullable<LinePayload["style"]>>(p);
  const from = point(p.from, [0, 0]);
  const to = point(p.to, [100, 0]);
  const color = style.color ?? COLORS.ink;
  const label = str(p.label);

  return (
    <g>
      <Connector from={from} to={to} color={color} width={num(style.strokeWidth, 2.5)} dashed={style.dashed} />
      {label && (
        <text
          x={(from[0] + to[0]) / 2}
          y={(from[1] + to[1]) / 2 - 9}
          textAnchor="middle"
          fontSize={13}
          fontWeight={700}
          fill={color}
          stroke="#ffffff"
          strokeWidth={4}
          strokeLinejoin="round"
          paintOrder="stroke"
        >
          {label}
        </text>
      )}
    </g>
  );
}

/** draw_line, underline */
export function DrawLine({ p }: SceneProps) {
  const style = styleOf<NonNullable<LinePayload["style"]>>(p);
  return (
    <Connector
      from={point(p.from, [0, 0])}
      to={point(p.to, [100, 0])}
      color={style.color ?? COLORS.faint}
      width={num(style.strokeWidth, 1.8)}
      arrow={false}
      dashed={style.dashed}
    />
  );
}

/** draw_path: raw SVG path data */
export function DrawPath({ p }: SceneProps) {
  const style = styleOf<NonNullable<PathPayload["style"]>>(p);
  const fill = style.fill ?? "none";
  const animated = fill === "none" && !style.dashed;

  return (
    <path
      d={str(p.d)}
      fill={fill}
      stroke={style.stroke ?? COLORS.ink}
      strokeWidth={num(style.strokeWidth, 2.5)}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={style.dashed ? "7 5" : undefined}
      pathLength={animated ? 1 : undefined}
      className={animated ? "wb-stroke" : undefined}
    />
  );
}

/** draw_badge: a short label in a pill */
export function DrawBadge({ p }: SceneProps) {
  const shadow = useShadowFilter();
  const style = styleOf<NonNullable<BadgePayload["style"]>>(p);
  const [x, y] = point(p.position, [100, 100]);
  const bg = style.bg ?? COLORS.teal;
  const size = num(style.fontSize, 15);
  const content = ellipsize(str(p.content), 42);
  const w = Math.max(56, textWidth(content, size, 0.6) + 28);
  const h = size + 14;

  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={h / 2} fill={bg} filter={shadow} />
      <text
        x={x + w / 2}
        y={y + h / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size}
        fontWeight={700}
        fill={style.color ?? readableOn(bg)}
      >
        {content}
      </text>
    </g>
  );
}

/** draw_callout: a speech-bubble note */
export function DrawCallout({ p }: SceneProps) {
  const shadow = useShadowFilter();
  const style = styleOf<NonNullable<CalloutPayload["style"]>>(p);
  const [x, y] = point(p.position, [100, 100]);
  const w = num(p.width, 260);
  const size = 15;
  const stroke = style.stroke ?? COLORS.mango;
  const maxLines = Math.min(5, Math.max(1, Math.floor((480 - y - 24) / (size * 1.4))));
  const lines = wrapLines(str(p.content), w - 28, size, maxLines);
  const h = 22 + lines.length * size * 1.35;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={w}
        height={h}
        rx={14}
        fill={style.bg ?? COLORS.mangoSoft}
        stroke={stroke}
        strokeWidth={1.8}
        filter={shadow}
      />
      <polygon
        points={`${x + 22},${y + h - 1} ${x + 40},${y + h - 1} ${x + 24},${y + h + 13}`}
        fill={style.bg ?? COLORS.mangoSoft}
        stroke={stroke}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
      <rect x={x + 23} y={y + h - 3} width={16} height={4} fill={style.bg ?? COLORS.mangoSoft} />
      <TextBlock
        lines={lines}
        x={x + 14}
        y={y + 14 + size * 0.8}
        size={size}
        color={style.color ?? COLORS.ink}
        weight={500}
        lineHeight={1.35}
      />
    </g>
  );
}

/** show_equation: written as plain text in a soft pill (no LaTeX engine) */
export function ShowEquation({ p }: SceneProps) {
  const style = styleOf<TextStyle>(p);
  const [x, y] = point(p.position, [400, 250]);
  const size = num(style.fontSize, 24);
  const content = str(p.latex);
  const color = style.color ?? COLORS.teal;
  const w = Math.max(80, textWidth(content, size, 0.6) + 36);
  const h = size + 22;

  return (
    <g>
      <rect
        x={x - w / 2}
        y={y - h / 2}
        width={w}
        height={h}
        rx={12}
        fill={COLORS.tealSoft}
        stroke={color}
        strokeWidth={1.8}
      />
      <text
        x={x}
        y={y}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={size}
        fontWeight={700}
        fontStyle="italic"
        fill={color}
      >
        {content}
      </text>
    </g>
  );
}

/** draw_highlight, highlight: a translucent marker over an area */
export function DrawHighlight({ p }: SceneProps) {
  const [x, y] = point(p.position, [30, 80]);
  const color = str(p.color, COLORS.mango);
  const label = str(p.label);
  const payload = p as unknown as Partial<HighlightPayload>;

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={num(payload.width, 200)}
        height={num(payload.height, 60)}
        rx={num(payload.rx, 10)}
        fill={color}
        fillOpacity={Math.max(0, Math.min(0.55, num(payload.opacity, 0.28)))}
        stroke={color}
        strokeOpacity={0.6}
        strokeWidth={1.5}
      />
      {label && (
        <text x={x + 10} y={y + 16} fontSize={11} fontWeight={700} fill={COLORS.ink} letterSpacing={0.8}>
          {label.toUpperCase()}
        </text>
      )}
    </g>
  );
}
