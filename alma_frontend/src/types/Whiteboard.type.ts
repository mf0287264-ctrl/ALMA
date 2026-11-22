/**
 * Whiteboard lesson contract.
 *
 * A lesson section is played as one "part": a timeline of scenes drawn on an
 * 800 x 500 board. Scenes are plain JSON, so the same data works for the
 * backend, the web player and any other client.
 */

export type Point = [number, number];
export type Payload = Record<string, unknown>;

export interface WhiteboardScene {
  id: string;
  /** Seconds from the start of the part when the scene appears. */
  time_offset: number;
  action_type: string;
  payload: Payload;
}

export interface WhiteboardPart {
  id: string;
  title: string;
  /** Full spoken script of the part (read aloud by the browser voice). */
  narration: string | null;
  duration_seconds: number;
  audio_url: string | null;
  scenes: WhiteboardScene[];
}

/** Props every scene renderer receives. `p` is the scene payload. */
export interface SceneProps {
  id: string;
  p: Payload;
  /** Seconds since this scene began. Animated explanations follow the lesson clock. */
  elapsed?: number;
  /** False skips interpolated motion while keeping each explanatory state visible. */
  motion?: boolean;
}

/* -------------------------------------------------------------------------
 * Payload reference (documentation for the scene renderers).
 * Every field is optional at runtime: renderers fall back to safe defaults.
 * ---------------------------------------------------------------------- */

export interface TextStyle {
  fontSize?: number;
  color?: string;
  fontWeight?: string | number;
  fontStyle?: string;
  textAnchor?: "start" | "middle" | "end";
  maxWidth?: number;
  maxLines?: number;
}

/** draw_text, write_text */
export interface TextPayload {
  content: string;
  position: Point;
  style?: TextStyle;
}

/** draw_rect */
export interface RectPayload {
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
  style?: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    rx?: number;
    /** No outline and no shadow: a plain patch of color. */
    flat?: boolean;
    /** Label options (not in the original export; ignored by older players). */
    fontSize?: number;
    fontWeight?: number | string;
    mono?: boolean;
  };
}

/** draw_circle */
export interface CirclePayload {
  center: Point;
  radius: number;
  label?: string;
  style?: { fill?: string; stroke?: string; strokeWidth?: number };
}

/** draw_arrow, draw_line */
export interface LinePayload {
  from: Point;
  to: Point;
  label?: string;
  style?: { color?: string; strokeWidth?: number; dashed?: boolean };
}

/** draw_path (SVG path data) */
export interface PathPayload {
  d: string;
  style?: { fill?: string; stroke?: string; strokeWidth?: number; dashed?: boolean };
}

/** draw_badge */
export interface BadgePayload {
  content: string;
  position: Point;
  style?: { bg?: string; color?: string; fontSize?: number };
}

/** draw_callout */
export interface CalloutPayload {
  content: string;
  position: Point;
  width?: number;
  style?: { bg?: string; stroke?: string; color?: string };
}

/** show_equation */
export interface EquationPayload {
  latex: string;
  position: Point;
  style?: TextStyle;
}

/** draw_highlight */
export interface HighlightPayload {
  position: Point;
  width: number;
  height: number;
  color?: string;
  opacity?: number;
  rx?: number;
  label?: string;
}

/** draw_table */
export interface TablePayload {
  headers: string[];
  rows: string[][];
  position?: Point;
  cell_width?: number;
  cell_height?: number;
}

/** draw_graph */
export interface GraphPayload {
  graph_type?: "bar" | "line";
  title?: string;
  position?: Point;
  size?: Point;
  data?: { values: number[]; labels?: string[] };
}

/** draw_coordinate_system */
export interface CoordinatePayload {
  origin?: Point;
  size?: Point;
  x_label?: string;
  y_label?: string;
  plot_points?: Point[];
}

/** draw_object: an icon in a rounded panel with an optional label */
export interface ObjectPayload {
  object_type: string;
  position?: Point;
  size?: Point;
  label?: string;
  annotations?: string[];
  accent?: string;
}

/** draw_physics_shape */
export interface PhysicsPayload {
  shape_type: string;
  position?: Point;
  size?: Point;
  label?: string;
  annotations?: string[];
}

/** draw_code_block */
export interface CodeBlockPayload {
  code: string;
  language?: string;
  position?: Point;
  width?: number;
  height?: number;
  title?: string;
  highlight_lines?: number[];
  active_line?: number;
  visible_lines?: number;
  command?: string;
  output?: string;
  execution_status?: "idle" | "running" | "success" | "error";
}

/** sandbox_question: handed to the host app, never drawn */
export interface SandboxPayload {
  title?: string;
  instructions?: string;
  language?: string;
  starterCode?: string;
}
