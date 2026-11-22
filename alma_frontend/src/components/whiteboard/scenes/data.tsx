/** Data figures: table, bar/line graph and coordinate system. */

import type { ReactNode } from "react";
import type { SceneProps } from "@/types/Whiteboard.type";
import { ACCENTS, COLORS } from "../theme";
import { CenteredLabel, Connector, useShadowFilter, TextBlock, arr, num, point, stagger, str } from "./helpers";

/* ------------------------------------------------------------------ table */

function tableRow(cells: string[], index: number, x: number, y: number, cellW: number, cellH: number, header: boolean): ReactNode {
  return (
    <g key={index} className="wb-slide" style={stagger(index, 110)}>
      {cells.map((cell, col) => (
        <g key={col}>
          <rect
            x={x + col * cellW}
            y={y}
            width={cellW}
            height={cellH}
            fill={header ? COLORS.ink : index % 2 ? COLORS.paper : "#fafaf8"}
            stroke={header ? COLORS.ink : COLORS.line}
          />
          <CenteredLabel
            cx={x + col * cellW + cellW / 2}
            cy={y + cellH / 2}
            text={cell}
            maxWidth={cellW - 12}
            size={Math.min(13, cellH * 0.4)}
            color={header ? "#ffffff" : COLORS.ink}
            weight={header ? 700 : 500}
            maxLines={2}
          />
        </g>
      ))}
    </g>
  );
}

/** draw_table: { headers, rows, position, cell_width, cell_height } */
export function DrawTable({ p }: SceneProps) {
  const shadow = useShadowFilter();
  const [x, y] = point(p.position, [60, 100]);
  const headers = arr(p.headers).map((h) => str(h));
  const rows = arr<unknown>(p.rows).map((row) => arr(row).map((cell) => str(cell)));
  const cols = Math.max(headers.length, ...rows.map((row) => row.length), 1);
  const cellW = Math.max(1, Math.min(num(p.cell_width, 120), (790 - x) / cols));
  const rowCount = rows.length + (headers.length ? 1 : 0);
  const cellH = Math.max(1, Math.min(num(p.cell_height, 34), (480 - y) / Math.max(1, rowCount)));
  const padRow = (row: string[]) => Array.from({ length: cols }, (_, index) => row[index] ?? "");

  return (
    <g filter={shadow}>
      {headers.length > 0 && tableRow(padRow(headers), 0, x, y, cellW, cellH, true)}
      {rows.map((row, i) => tableRow(padRow(row), i + 1, x, y + (i + (headers.length ? 1 : 0)) * cellH, cellW, cellH, false))}
    </g>
  );
}

/* ------------------------------------------------------------------ graph */

/** draw_graph: { graph_type: "bar" | "line", title, position, size, data: { values, labels } } */
export function DrawGraph({ p }: SceneProps) {
  const shadow = useShadowFilter();
  const [ox, oy] = point(p.position, [90, 100]);
  const [w, h] = point(p.size, [300, 200]);
  const data = (p.data && typeof p.data === "object" ? p.data : {}) as { values?: unknown; labels?: unknown };
  const values = arr(data.values).map((v) => num(v));
  if (!values.length) return null;

  const labels = arr(data.labels).map((label) => str(label));
  const max = Math.max(...values, 0) || 1;
  const min = Math.min(...values, 0);
  const slot = (w - 20) / values.length;
  const barX = (i: number) => ox + 10 + i * slot + slot / 2;
  const valueY = (v: number) => oy + 12 + ((max - v) / (max - min)) * (h - 24);
  const baseline = valueY(0);
  const title = str(p.title);

  return (
    <g>
      <rect x={ox - 24} y={oy - 36} width={w + 48} height={h + 70} rx={16} fill={COLORS.paper} stroke={COLORS.line} filter={shadow} />
      {title && (
        <text x={ox + w / 2} y={oy - 14} textAnchor="middle" fontSize={14} fontWeight={700} fill={COLORS.ink}>
          {title}
        </text>
      )}
      {[0, 0.25, 0.5, 0.75, 1].map((ratio) => (
        <g key={ratio}>
          <line x1={ox} x2={ox + w} y1={valueY(min + (max - min) * ratio)} y2={valueY(min + (max - min) * ratio)} stroke={COLORS.line} strokeDasharray="5 5" />
          <text x={ox - 5} y={valueY(min + (max - min) * ratio) + 3} textAnchor="end" fontSize={9} fill={COLORS.muted}>{Number((min + (max - min) * ratio).toFixed(1))}</text>
        </g>
      ))}
      <line x1={ox} y1={oy} x2={ox} y2={oy + h} stroke={COLORS.muted} strokeWidth={1.5} />
      <line x1={ox} y1={baseline} x2={ox + w} y2={baseline} stroke={COLORS.muted} strokeWidth={1.5} />

      {p.graph_type === "line" ? (
        <>
          <path
            d={`M ${values.map((v, i) => `${barX(i)} ${valueY(v)}`).join(" L ")}`}
            fill="none"
            stroke={COLORS.teal}
            strokeWidth={3}
            strokeLinecap="round"
            strokeLinejoin="round"
            pathLength={1}
            className="wb-stroke"
          />
          {values.map((v, i) => (
            <circle key={i} cx={barX(i)} cy={valueY(v)} r={4.5} fill={COLORS.paper} stroke={COLORS.teal} strokeWidth={2.5} className="wb-item" style={stagger(i, 120)} />
          ))}
        </>
      ) : (
        values.map((v, i) => {
          const barW = Math.min(60, slot * 0.62);
          const top = valueY(v);
          return (
            <g key={i}>
              <rect
                x={barX(i) - barW / 2}
                y={Math.min(top, baseline)}
                width={barW}
                height={Math.max(0.5, Math.abs(baseline - top))}
                rx={4}
                fill={ACCENTS[i % ACCENTS.length]}
                className="wb-grow"
                style={{ ...stagger(i, 90), transformOrigin: v < 0 ? "top" : "bottom" }}
              />
              <text className="wb-label" x={barX(i)} y={top + (v < 0 ? 14 : -6)} textAnchor="middle" fontSize={11} fontWeight={700} fill={COLORS.ink}>
                {v}
              </text>
            </g>
          );
        })
      )}

      {values.map((_, i) => (
        <text key={i} x={barX(i)} y={oy + h + 16} textAnchor="middle" fontSize={11} fill={COLORS.muted}>
          {labels[i] ?? i + 1}
        </text>
      ))}
    </g>
  );
}

/* ------------------------------------------------------- coordinate system */

/** draw_coordinate_system: { origin, size, x_label, y_label, plot_points } (axes run -5..5) */
export function DrawCoordinateSystem({ p }: SceneProps) {
  const shadow = useShadowFilter();
  const [ox, oy] = point(p.origin, [400, 280]);
  const [w, h] = point(p.size, [300, 240]);
  const range = 5;
  const toX = (v: number) => ox + (v / range) * (w / 2);
  const toY = (v: number) => oy - (v / range) * (h / 2);
  const points = arr<unknown>(p.plot_points).map((pt) => point(pt, [0, 0]));
  const ticks = Array.from({ length: range * 2 + 1 }, (_, i) => i - range).filter((v) => v !== 0);

  return (
    <g>
      <rect x={ox - w / 2 - 24} y={oy - h / 2 - 26} width={w + 56} height={h + 56} rx={16} fill={COLORS.paper} stroke={COLORS.line} filter={shadow} />
      {ticks.map((v) => (
        <g key={v}>
          <line x1={toX(v)} x2={toX(v)} y1={oy - h / 2} y2={oy + h / 2} stroke={COLORS.line} strokeDasharray="4 6" />
          <line x1={ox - w / 2} x2={ox + w / 2} y1={toY(v)} y2={toY(v)} stroke={COLORS.line} strokeDasharray="4 6" />
          <text x={toX(v)} y={oy + 14} textAnchor="middle" fontSize={9} fill={COLORS.muted}>{v}</text>
          <text x={ox - 7} y={toY(v) + 3} textAnchor="end" fontSize={9} fill={COLORS.muted}>{v}</text>
        </g>
      ))}
      <Connector from={[ox - w / 2, oy]} to={[ox + w / 2 + 8, oy]} color={COLORS.muted} width={1.8} />
      <Connector from={[ox, oy + h / 2]} to={[ox, oy - h / 2 - 8]} color={COLORS.muted} width={1.8} />
      <TextBlock lines={[str(p.x_label, "x")]} x={ox + w / 2 + 4} y={oy + 20} size={14} color={COLORS.muted} italic />
      <TextBlock lines={[str(p.y_label, "y")]} x={ox + 10} y={oy - h / 2 - 6} size={14} color={COLORS.muted} italic />
      {points.length > 1 && (
        <path
          d={`M ${points.map(([x, y]) => `${toX(x)} ${toY(y)}`).join(" L ")}`}
          fill="none"
          stroke={COLORS.mango}
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
          pathLength={1}
          className="wb-stroke"
        />
      )}
      {points.map(([x, y], i) => (
        <circle key={i} className="wb-item" style={stagger(i, 120)} cx={toX(x)} cy={toY(y)} r={4.5} fill={COLORS.paper} stroke={COLORS.mango} strokeWidth={2.5} />
      ))}
    </g>
  );
}
