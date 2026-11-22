/**
 * Scene registry: maps every action_type to its renderer.
 *
 * To add a scene type: write a renderer (see shapes.tsx), then add one line here.
 * `motion` is how it arrives on the board (see whiteboard.css):
 *   write = handwritten left to right, pop = grows in, rise = slides up, none = no entrance.
 *
 * Control scenes (clear, camera, draw_caption, sandbox_question) are not listed:
 * they steer playback and are handled by getBoardState in playback.ts.
 */

import { createElement, type ComponentType } from "react";
import type { Payload, SceneProps } from "@/types/Whiteboard.type";
import { DrawCodeBlock, DrawCodeDiff, DrawLanguageShowcase } from "./code";
import { DrawCoordinateSystem, DrawGraph, DrawTable } from "./data";
import { DrawObject } from "./objects";
import { DrawDiagram, DrawPhysicsShape, DrawStructure } from "./diagrams";
import { AnimateCollection, AnimateLoop, AnimateSearch, AnimateSort, AnimateTransfer } from "./algorithms";
import {
  DrawArrow,
  DrawBadge,
  DrawCallout,
  DrawCircle,
  DrawHighlight,
  DrawLine,
  DrawPath,
  DrawRect,
  DrawText,
  ShowEquation,
} from "./shapes";

type Motion = "write" | "pop" | "rise" | "none";

interface SceneDefinition {
  render: ComponentType<SceneProps>;
  /** A function lets one scene type choose its entrance from its payload. */
  motion: Motion | ((payload: Payload) => Motion);
  /** Updates with the clock for movements that demonstrate an algorithm. */
  live?: boolean;
}

const define = (render: ComponentType<SceneProps>, motion: SceneDefinition["motion"]): SceneDefinition => ({ render, motion });

export const SCENES: Record<string, SceneDefinition> = {
  // text and ink
  draw_text: define(DrawText, "write"),
  write_text: define(DrawText, "write"),
  show_equation: define(ShowEquation, "write"),
  draw_line: define(DrawLine, "none"),
  underline: define(DrawLine, "none"),
  draw_arrow: define(DrawArrow, "none"),
  draw_path: define(DrawPath, "none"),

  // shapes
  draw_rect: define(DrawRect, "pop"),
  draw_circle: define(DrawCircle, "pop"),
  draw_badge: define(DrawBadge, "pop"),
  draw_callout: define(DrawCallout, "pop"),
  draw_highlight: define(DrawHighlight, "write"),
  highlight: define(DrawHighlight, "write"),
  draw_object: define(DrawObject, "pop"),

  // data
  draw_table: define(DrawTable, "rise"),
  draw_graph: define(DrawGraph, "rise"),
  draw_coordinate_system: define(DrawCoordinateSystem, "rise"),

  // code
  // `append` marks a block that extends the one already on the board: nothing re-enters
  draw_code_block: define(DrawCodeBlock, (p) => (p.append ? "none" : "rise")),
  draw_code_diff: define(DrawCodeDiff, "rise"),
  draw_language_showcase: define(DrawLanguageShowcase, "rise"),

  // data structures and diagrams
  draw_array: define(DrawStructure, "rise"),
  draw_stack: define(({ p, id }) => createElement(DrawStructure, { id, p: { ...p, structure: "stack" } }), "rise"),
  draw_queue: define(({ p, id }) => createElement(DrawStructure, { id, p: { ...p, structure: "queue" } }), "rise"),
  draw_flowchart: define(DrawDiagram, "rise"),
  draw_tree: define(DrawDiagram, "rise"),
  draw_network: define(DrawDiagram, "rise"),
  draw_physics_shape: { ...define(DrawPhysicsShape, "pop"), live: true },

  // computer science concepts
  animate_loop: { ...define(AnimateLoop, "rise"), live: true },
  animate_search: { ...define(AnimateSearch, "rise"), live: true },
  animate_sort: { ...define(AnimateSort, "rise"), live: true },
  animate_stack: { ...define(({ p, id, elapsed, motion }) => createElement(AnimateCollection, { id, elapsed, motion, p: { ...p, structure: "stack" } }), "rise"), live: true },
  animate_queue: { ...define(AnimateCollection, "rise"), live: true },
  animate_transfer: { ...define(AnimateTransfer, "none"), live: true },
};
