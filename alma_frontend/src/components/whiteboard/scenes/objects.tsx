/**
 * draw_object: an icon in a soft panel with a label and optional notes.
 * Icons come from lucide-react, the same icon set as the rest of ALMA.
 */

import type { LucideIcon } from "lucide-react";
import {
  Blocks, BookOpen, Brain, Building2, Check, CircleDollarSign, Clock, Cloud, Cog, Compass, Cpu,
  Database, FileText, Flag, FlaskConical, Folder, Gauge, Globe, Handshake, Key, Layers, Leaf,
  Lightbulb, ListChecks, Lock, Mail, MessagesSquare, Microscope, Network, Pencil, RefreshCw, Rocket,
  Search, Server, Settings, Shapes, ShieldCheck, Star, Target, TrendingUp, Triangle, TriangleAlert,
  User, Users, X,
} from "lucide-react";
import type { ObjectPayload, SceneProps } from "@/types/Whiteboard.type";
import { COLORS } from "../theme";
import { CenteredLabel, useShadowFilter, TextBlock, arr, point, str, wrapLines } from "./helpers";

const ICONS: Record<string, [LucideIcon, string]> = {
  // simple icons
  person: [User, COLORS.blue],
  users: [Users, COLORS.teal],
  database: [Database, COLORS.blue],
  server: [Server, COLORS.muted],
  cloud: [Cloud, COLORS.blue],
  folder: [Folder, COLORS.mango],
  shield: [ShieldCheck, COLORS.teal],
  lock: [Lock, COLORS.ink],
  key: [Key, COLORS.mango],
  check: [Check, COLORS.teal],
  cross: [X, COLORS.pink],
  brain: [Brain, COLORS.pink],
  money: [CircleDollarSign, COLORS.teal],
  building: [Building2, COLORS.blue],
  globe: [Globe, COLORS.teal],
  envelope: [Mail, COLORS.blue],
  chip: [Cpu, COLORS.teal],
  flag: [Flag, COLORS.pink],
  star: [Star, COLORS.mango],
  warning: [TriangleAlert, COLORS.mango],
  gauge: [Gauge, COLORS.blue],
  rocket: [Rocket, COLORS.pink],
  handshake: [Handshake, COLORS.teal],
  chart_up: [TrendingUp, COLORS.teal],
  pencil_edit: [Pencil, COLORS.mango],
  cog_icon: [Settings, COLORS.muted],
  clock: [Clock, COLORS.blue],
  search: [Search, COLORS.blue],
  // figures
  cell: [Microscope, COLORS.teal],
  network: [Network, COLORS.blue],
  blockchain: [Blocks, COLORS.blue],
  cycle: [RefreshCw, COLORS.teal],
  gear: [Cog, COLORS.muted],
  document: [FileText, COLORS.blue],
  checklist: [ListChecks, COLORS.teal],
  triangle: [Triangle, COLORS.mango],
  leaf: [Leaf, COLORS.teal],
  flask: [FlaskConical, COLORS.pink],
  lightbulb: [Lightbulb, COLORS.mango],
  target: [Target, COLORS.pink],
  book: [BookOpen, COLORS.blue],
  dialogue: [MessagesSquare, COLORS.teal],
  layers: [Layers, COLORS.blue],
  compass: [Compass, COLORS.mango],
};

/** draw_object: { object_type, position, size, label, annotations, accent } */
export function DrawObject({ p }: SceneProps) {
  const shadow = useShadowFilter();
  const payload = p as unknown as Partial<ObjectPayload>;
  const [x, y] = point(payload.position, [140, 120]);
  const [w, h] = point(payload.size, [220, 180]);
  const [Icon, defaultAccent] = ICONS[str(payload.object_type)] ?? [Shapes, COLORS.teal];
  const accent = str(payload.accent, defaultAccent);
  const label = str(payload.label);
  const notes = arr(payload.annotations).map((note) => str(note)).slice(0, 3);

  // Small panels put the label underneath, big ones keep it inside.
  const labelInside = h >= 120;
  const iconSize = Math.min(w, h) * (labelInside ? 0.42 : 0.56);
  const iconY = labelInside ? y + h * 0.16 : y + (h - iconSize) / 2;

  // Notes go to the right of the panel, or to the left when there is no room.
  const noteW = 170;
  const noteX = x + w + 14 + noteW > 790 ? x - 14 - noteW : x + w + 14;

  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx={18} fill={accent} fillOpacity={0.1} stroke={accent} strokeOpacity={0.55} strokeWidth={2} />
      <Icon className={payload.object_type === "gear" || payload.object_type === "cycle" ? "wb-gear-turn" : "wb-icon-arrive"} x={x + (w - iconSize) / 2} y={iconY} width={iconSize} height={iconSize} color={accent} strokeWidth={1.7} />
      {label && labelInside && (
        <CenteredLabel cx={x + w / 2} cy={y + h - 30} text={label} maxWidth={w - 24} size={15} maxLines={2} />
      )}
      {label && !labelInside && (
        <CenteredLabel cx={x + w / 2} cy={y + h + 18} text={label} maxWidth={Math.max(w, 110)} size={14} maxLines={2} />
      )}
      {notes.map((note, i) => {
        const lines = wrapLines(note, noteW - 28, 12, 2);
        const top = y + 6 + i * 50;
        return (
          <g key={i} className="wb-slide" style={{ ["--d" as string]: `${(i + 1) * 150}ms` }}>
            <rect x={noteX} y={top} width={noteW} height={40} rx={12} fill={COLORS.paper} stroke={accent} strokeOpacity={0.5} filter={shadow} />
            <rect x={noteX + 8} y={top + 9} width={4} height={22} rx={2} fill={accent} />
            <TextBlock lines={lines} x={noteX + 20} y={top + (lines.length > 1 ? 17 : 24)} size={12} weight={600} />
          </g>
        );
      })}
    </g>
  );
}
