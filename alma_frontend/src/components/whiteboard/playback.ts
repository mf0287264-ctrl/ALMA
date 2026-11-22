import type { Point, WhiteboardScene } from "@/types/Whiteboard.type";

/** Scenes that steer playback instead of drawing ink. */
const CONTROL_SCENES = new Set(["clear", "camera", "draw_caption", "sandbox_question"]);

/** The pen follows ink that appeared this recently. */
const PEN_SECONDS = 1.1;

export interface Caption {
  time: number;
  text: string;
  /** Seconds the sentence stays on screen (estimated reading/speaking time). */
  duration: number;
  index: number;
  total: number;
}

export interface Chapter {
  time: number;
  title: string;
}

export interface BoardState {
  /** Ink currently on the board, oldest first. */
  visible: WhiteboardScene[];
  /** Subtitle for the current moment (null after a clear until the next one). */
  caption: Caption | null;
  zoom: number;
  /** Latest sandbox_question reached, handed to the host app. */
  sandbox: WhiteboardScene | null;
  /** Ink drawn since this time belongs to the sentence being explained right now. */
  currentSince: number;
  /** Where the pen is drawing right now (null when nothing new is being drawn). */
  pen: Point | null;
  /** Identifies the latest page, including clears at shared timestamps. */
  pageId: string;
  pageTime: number;
  focus: Point;
}

const isPoint = (value: unknown): value is Point =>
  Array.isArray(value) && value.length >= 2 && typeof value[0] === "number" && Number.isFinite(value[0]) && typeof value[1] === "number" && Number.isFinite(value[1]);

/** The spot on the board where a scene is drawn (where the pen should go). */
export function anchorOf(scene: WhiteboardScene): Point | null {
  const p = scene.payload;
  if (isPoint(p.to)) return p.to;
  if (isPoint(p.center)) return p.center;

  const origin = isPoint(p.position) ? p.position : typeof p.x === "number" && typeof p.y === "number" ? ([p.x, p.y] as Point) : null;
  if (!origin) return null;

  const [width, height] = isPoint(p.size) ? p.size : [Number(p.width) || 0, Number(p.height) || 0];
  // Code blocks only know their width: aim at the first line.
  if (scene.action_type === "draw_code_block") return [origin[0] + (width || 300) / 2, origin[1] + 50];
  return [origin[0] + width / 2, origin[1] + height / 2];
}

/**
 * Playback rules (this is the whole "engine"):
 * - A scene shows when time_offset <= elapsed and it is after the last `clear`.
 * - `clear` wipes the board. Captions reset with it.
 * - `draw_caption` is the subtitle, not ink. The latest one after the last clear wins.
 * - `camera` never draws: enter = zoom, focus = zoom * 1.15, reset = 1.
 * - `sandbox_question` is never drawn; the host app opens its own exercise.
 *
 * `scenes` must be sorted by time_offset (toWhiteboardPart does this).
 */
export function getBoardState(scenes: WhiteboardScene[], elapsed: number): BoardState {
  const state: BoardState = { visible: [], caption: null, zoom: 1, sandbox: null, currentSince: Infinity, pen: null, pageId: "initial", pageTime: 0, focus: [400, 250] };

  for (const scene of scenes) {
    if (scene.time_offset > elapsed) break;
    const { action_type: type, payload } = scene;

    if (type === "clear") {
      state.visible = [];
      state.caption = null;
      state.pen = null;
      state.currentSince = Infinity;
      state.zoom = 1;
      state.focus = [400, 250];
      state.pageId = scene.id;
      state.pageTime = scene.time_offset;
    } else if (type === "camera") {
      const rawZoom = Number(payload.zoom);
      const zoom = Number.isFinite(rawZoom) && rawZoom > 0 ? rawZoom : 1;
      state.zoom = Math.min(2.5, Math.max(0.5, payload.mode === "focus" ? zoom * 1.15 : payload.mode === "enter" ? zoom : 1));
      state.focus = payload.mode === "reset" ? [400, 250] : isPoint(payload.position) ? payload.position : state.focus;
    } else if (type === "sandbox_question") {
      state.sandbox = scene;
    } else if (type === "draw_caption") {
      const text = String(payload.content ?? "");
      state.caption = {
        time: scene.time_offset,
        text,
        duration: Math.max(0.1, Number(payload.estimatedDurationSeconds) || Math.max(2.4, text.split(/\s+/).length / 2.6)),
        index: Math.max(0, Number(payload.index) || 0),
        total: Math.max(1, Number(payload.total) || 1),
      };
      state.currentSince = scene.time_offset;
    } else if (!CONTROL_SCENES.has(type)) {
      // Later snapshots of a code/output panel replace the earlier panel at that position.
      if (type === "draw_code_block" || payload.replace === true || typeof payload.target_id === "string") {
        state.visible = state.visible.filter((previous) => {
          if (payload.target_id === previous.id) return false;
          if ((type !== "draw_code_block" && payload.replace !== true) || previous.action_type !== type) return true;
          const a = previous.payload.position ?? [previous.payload.x ?? 50, previous.payload.y ?? 50];
          const b = payload.position ?? [payload.x ?? 50, payload.y ?? 50];
          return !isPoint(a) || !isPoint(b) || a[0] !== b[0] || a[1] !== b[1];
        });
      }
      state.visible.push(scene);
      if (elapsed - scene.time_offset < PEN_SECONDS) state.pen = anchorOf(scene) ?? state.pen;
    }
  }

  return state;
}

/** Every caption of a part in time order (used for the spoken narration and stepping). */
export function getCaptions(scenes: WhiteboardScene[]): { time: number; text: string }[] {
  return scenes
    .filter((scene) => scene.action_type === "draw_caption")
    .map((scene) => ({ time: scene.time_offset, text: String(scene.payload.content ?? "").trim() }))
    .filter((caption) => caption.text);
}

/** Beats of the lesson part: every `clear` that carries a title starts one. */
export function getChapters(scenes: WhiteboardScene[]): Chapter[] {
  return scenes
    .filter((scene) => scene.action_type === "clear" && typeof scene.payload.title === "string")
    .map((scene) => ({ time: scene.time_offset, title: String(scene.payload.title) }));
}
