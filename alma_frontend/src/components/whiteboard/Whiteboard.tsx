"use client";

import { Component, memo, useId, useState, type CSSProperties, type ReactNode } from "react";
import { Pencil } from "lucide-react";
import type { Point, WhiteboardScene } from "@/types/Whiteboard.type";
import { SCENES } from "./scenes";
import { BOARD, COLORS } from "./theme";
import { SceneScope } from "./scenes/helpers";
import { useReducedMotion } from "./useReducedMotion";
import "./whiteboard.css";

/** A scene that appeared this recently still plays its entrance; older ones just show (after a seek). */
const FRESH_SECONDS = 0.8;

/** One broken scene must never blank the whole board. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/**
 * Draws one scene. It only re-renders when the scene itself (or its glow) changes, so ink
 * that is already on the board is never redrawn or re-animated by the clock ticking.
 */
const SceneView = memo(
  function SceneView({ scene, elapsed, glowing, animateAfter, scope, motionAllowed }: { scene: WhiteboardScene; elapsed: number; glowing: boolean; animateAfter: number; scope: string; motionAllowed: boolean }) {
    // Decided once, when the scene first appears.
    const [fresh] = useState(() => scene.time_offset > animateAfter && elapsed - scene.time_offset < FRESH_SECONDS);
    const definition = Object.hasOwn(SCENES, scene.action_type) ? SCENES[scene.action_type] : null;
    if (!definition) return null;

    const Render = definition.render;
    const motion = typeof definition.motion === "function" ? definition.motion(scene.payload) : definition.motion;

    // The glow wraps the entrance so a seek (which skips entrances) can still highlight the current step.
    return (
      <SceneBoundary>
        <g className={glowing ? "wb-current" : undefined}>
          <g className={`wb-in wb-in-${motion}${fresh ? "" : " wb-instant"}`}>
            <SceneScope.Provider value={scope}>
              <Render id={`${scope}-${scene.id}`} p={scene.payload} elapsed={Math.max(0, elapsed - scene.time_offset)} motion={motionAllowed} />
            </SceneScope.Provider>
          </g>
        </g>
      </SceneBoundary>
    );
  },
  (previous, next) => previous.scene === next.scene && previous.glowing === next.glowing && previous.animateAfter === next.animateAfter && previous.scope === next.scope && previous.motionAllowed === next.motionAllowed && (!SCENES[next.scene.action_type]?.live || previous.elapsed === next.elapsed),
);

/** The teacher's pen: glides to wherever new ink is being drawn, then fades away. */
function Pen({ at }: { at: Point | null }) {
  // Remember the last spot so the pen can fade out where it stopped.
  const [spot, setSpot] = useState<Point>([BOARD.width / 2, BOARD.height / 2]);
  if (at && (at[0] !== spot[0] || at[1] !== spot[1])) setSpot(at);

  return (
    <g className="wb-pen" style={{ transform: `translate(${spot[0]}px, ${spot[1]}px)`, opacity: at ? 1 : 0 }}>
      <circle className="wb-pen-ripple" r={11} fill={COLORS.mango} fillOpacity={0.18} />
      <g className={at ? "wb-pen-scribble" : undefined}>
        <Pencil x={-4} y={-27} width={30} height={30} color={COLORS.ink} fill={COLORS.mango} strokeWidth={1.6} />
      </g>
    </g>
  );
}

interface WhiteboardProps {
  /** Ink that should be on the board right now (see getBoardState). */
  scenes: WhiteboardScene[];
  elapsed: number;
  zoom?: number;
  /** Ink drawn since this time glows (the sentence being explained). Only while `glow` is true. */
  currentSince?: number;
  glow?: boolean;
  /** Where the pen is drawing, if anywhere. */
  pen?: Point | null;
  onClick?: () => void;
  /** Overlays such as the play button. */
  children?: ReactNode;
  playing?: boolean;
  motion?: boolean;
  grid?: boolean;
  speed?: number;
  animateAfter?: number;
  revision?: number;
  pageId?: string;
  pageTime?: number;
  focus?: Point;
}

/** The 800 x 500 board. It scales to any width and keeps its proportions. */
export default function Whiteboard({
  scenes,
  elapsed,
  zoom = 1,
  currentSince = Infinity,
  glow = false,
  pen = null,
  onClick,
  children,
  playing = true,
  motion = true,
  grid = true,
  speed = 1,
  animateAfter = -1,
  revision = 0,
  pageId = "initial",
  pageTime = 0,
  focus = [400, 250],
}: WhiteboardProps) {
  const scope = `wb-${useId().replace(/[^\w-]/g, "")}`;
  const reducedMotion = useReducedMotion();
  return (
    <div
      className={`wb-board relative w-full overflow-hidden rounded-2xl border border-[#e8eeea] bg-white shadow-xs ${onClick ? "cursor-pointer" : ""} ${playing ? "" : "wb-paused"} ${motion ? "" : "wb-motion-off"}`}
      style={{ aspectRatio: `${BOARD.width} / ${BOARD.height}`, "--wb-rate": speed } as CSSProperties}
      onClick={onClick}
    >
      <svg
        viewBox={`0 0 ${BOARD.width} ${BOARD.height}`}
        className="absolute inset-0 h-full w-full"
        role="img"
        aria-label="Lesson whiteboard"
      >
        <defs>
          <pattern id={`${scope}-grid`} width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke={COLORS.grid} strokeWidth="1" />
          </pattern>
          <filter id={`${scope}-shadow`} x="-10%" y="-10%" width="120%" height="135%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor={COLORS.ink} floodOpacity="0.14" />
          </filter>
        </defs>

        {grid && <rect width={BOARD.width} height={BOARD.height} fill={`url(#${scope}-grid)`} />}

        <g
          style={{
            transform: `translate(${BOARD.width / 2 - focus[0] * zoom}px, ${BOARD.height / 2 - focus[1] * zoom}px) scale(${zoom})`,
          }}
          className="wb-camera"
        >
          <g key={`${pageId}-${revision}`} className={pageTime > animateAfter && elapsed - pageTime < FRESH_SECONDS ? "wb-page-in" : undefined}>
          {scenes.map((scene) => (
            <SceneView key={scene.id} scene={scene} elapsed={elapsed} animateAfter={animateAfter} scope={scope} motionAllowed={motion && !reducedMotion} glowing={glow && scene.time_offset >= currentSince} />
          ))}
          </g>
          <Pen at={pen} />
        </g>
      </svg>

      {children}
    </div>
  );
}
