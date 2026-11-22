import type { WhiteboardPart, WhiteboardScene } from "@/types/Whiteboard.type";

type Json = Record<string, unknown>;
const isRecord = (value: unknown): value is Json => !!value && typeof value === "object" && !Array.isArray(value);

const toNumber = (value: unknown, fallback = 0) => {
  const n = typeof value === "number" ? value : Number(value);
  return Number.isFinite(n) ? n : fallback;
};

/**
 * Accepts both scene shapes:
 *  - stored scenes:   { id, time_offset, action_type, payload }
 *  - generator output: { time, type, ...payload fields inline }
 */
function toScene(raw: Json, index: number): WhiteboardScene {
  const nested = isRecord(raw.payload) ? raw.payload : null;
  const action = String(raw.action_type ?? raw.type ?? "draw_text");

  // Generator scenes carry their payload inline next to the scene fields.
  const payload: Json = { ...(nested ?? raw) };
  if (!nested) {
    for (const key of ["time", "type", "action_type", "id", "time_offset"]) delete payload[key];
  }

  return {
    id: String(raw.id ?? `${action}-${index}`),
    time_offset: Math.max(0, toNumber(raw.time_offset ?? raw.time)),
    action_type: action,
    payload,
  };
}

/**
 * Turns anything the backend or generator may give us into a whiteboard part:
 * a part (scenes[]), a full lesson (uses parts[0]) or a flat visual_sequence[].
 */
export function toWhiteboardPart(input: unknown): WhiteboardPart {
  const json = isRecord(input) ? input : {};
  const source = Array.isArray(json.parts) ? (json.parts.find(isRecord) ?? {}) : json;
  const candidate = source.scenes ?? source.visual_sequence ?? (Array.isArray(input) ? input : []);
  const rawScenes = Array.isArray(candidate) ? candidate : [];
  const ids = new Set<string>();

  // Stable sort keeps scenes that share a timestamp in their original order.
  const scenes = rawScenes
    .filter(isRecord)
    .map(toScene)
    .map((scene) => {
      const base = scene.id;
      let suffix = 1;
      while (ids.has(scene.id)) scene.id = `${base}-${suffix++}`;
      ids.add(scene.id);
      return scene;
    })
    .sort((a, b) => a.time_offset - b.time_offset);

  const lastScene = scenes.length ? scenes[scenes.length - 1].time_offset : 0;

  return {
    id: String(source.id ?? "part"),
    title: String(source.title ?? "Lesson"),
    narration: typeof source.narration === "string" ? source.narration : null,
    duration_seconds: Math.max(toNumber(source.duration_seconds), lastScene + 1.5),
    audio_url: typeof source.audio_url === "string" ? source.audio_url : null,
    scenes,
  };
}
