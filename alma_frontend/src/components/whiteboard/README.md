# Lesson whiteboard

The lesson page is available at `/lesson`. It opens with five complete default lessons and can also load academy lessons. Existing academy deep links use `/lesson?lesson=0&section=0`; add `autoplay=1` to start automatically.

```tsx
import { WhiteboardPlayer } from "@/components/whiteboard";

<WhiteboardPlayer lesson={section.whiteboard} onEnd={markSectionComplete} />
```

The player accepts a part with `scenes`, a lesson with `parts` (plays the first part), a `visual_sequence`, or an array of inline scenes. Scenes use seconds and an 800 × 500 coordinate system. Input is normalized, sorted, and assigned unique IDs. Updating lesson content resets playback even when its ID stays the same.

Controls include play/pause, replay, previous/next sentence, seeking, speed, voice, fullscreen, chapter navigation, transcript, grid, and animations. Space/K toggles playback, arrows step between sentences, J/L move five seconds, M toggles voice, F toggles fullscreen, and 1–9 select chapters. Keyboard shortcuts apply while the player is focused and do not intercept form fields or modified shortcuts. Animations respect pause, playback speed, seeks, and reduced-motion preferences.

A supplied `audio_url` plays the recording. If recording playback fails, the browser reads captions instead. Without captions, `narration` is read as a single script. Browser voices and autoplay depend on browser support and user settings.

`sandbox_question` pauses at its exact timestamp. The default card supports multiline output, preserves case and punctuation, and lets students reveal the answer. Questions without a reference answer provide a Continue button without claiming correctness. An optional `onSandboxQuestion(payload, sceneId)` can handle an exercise; return a promise to resume once it completes. Rejection or a synchronous handler falls back to the built-in card. Replay resets answers.

## Scenes

- Text/ink: `draw_text`, `write_text`, `show_equation`, `draw_line`, `underline`, `draw_arrow`, `draw_path`.
- Shapes: `draw_rect`, `draw_circle`, `draw_badge`, `draw_callout`, `draw_highlight`, `highlight`, `draw_object`.
- Data: `draw_table`, `draw_graph`, `draw_coordinate_system`.
- Code: `draw_code_block`, `draw_code_diff`, `draw_language_showcase`.
- Structures: `draw_array`, `draw_stack`, `draw_queue` with `values`, `position`, optional `width`, `label`, and `active_index`.
- Diagrams: `draw_flowchart`, `draw_tree`, `draw_network` with `nodes: [{id, label, position?, kind?}]` and `edges: [{from, to, label?}]`. Node kinds include `decision` and `terminal`. Explicit node positions are top-left board coordinates.
- Science: `draw_physics_shape` with `shape_type` (`pendulum`, `spring`, `wave`, `triangle`), `position`, `size`, and optional `label`.
- Explanatory animations: `animate_loop`, `animate_search`, `animate_sort`, `animate_stack`, `animate_queue`, `animate_transfer`. These derive every intermediate state from the lesson clock: no random movement or independent timers. Loop values move into assignment, the active code line, and output. Searches compare values and shrink candidate ranges. Bubble sort performs real adjacent comparisons and swaps. Collections show actual push/pop and enqueue/dequeue operations. Use `values`, `step_seconds`, and the matching algorithm fields (`target`, `strategy`, or `operations`).
- Playback: `clear`, `camera`, `draw_caption`, `sandbox_question`.

`clear` respects scene order, including scenes at the same timestamp. It resets the board, caption, and camera. Camera supports `enter`, `focus`, and `reset`, with optional `zoom` and `position`. Updated code blocks replace prior blocks at the same position. Other figure snapshots can set `replace: true`; a scene can replace a specific previous scene with `target_id`. Backward seeks reconstruct earlier snapshots correctly. Each mounted board has separate SVG filter and clipping IDs.

`show_equation` displays text; it does not parse LaTeX. Science figures illustrate concepts rather than calculating a physical simulation. Pendulum angles, spring compression, and wave propagation follow the clock; a marked wave point oscillates while the wave travels.

## Authoring and verification

The backend `buildWhiteboard` supports the original nine layouts plus `array`, `diagram`, `chart`, `physics`, and `algorithm`; see `src/Whiteboard/layouts.js` for their fields. `defaultLessons.ts` contains ready-to-play lesson timelines.

Future generation requests receive `whiteboard_generation` defaults from `src/Whiteboard/generationDefaults.js`, including an explanatory animation policy, limits, and a valid sample storyboard. Lesson create/update compiles `whiteboard.plan`, `whiteboard_plan`, or `board` plans before storage. Sections with reading blocks and no storyboard receive a board automatically; an exact supported two-line Python loop gets a loop execution animation. Other source is described and highlighted without execution or invented output.

The `algorithm` layout automatically fills in missing spoken operational steps from its actual values and operations. It emits `step_times` and `end_time` so comparisons, swaps, and collection operations follow caption boundaries. Existing `flow`, `code`, `trace`, and `boxes` layouts now include meaningful data or execution transfers by default. The compiler reserves enough time for a movement before the next spoken step and for the entire algorithm before clearing the page.

Run `node --test tests/whiteboard.test.mjs` from the repository root with Node 24 or newer. From `alma_frontend`, run `npx --no-install tsc --noEmit --incremental false` and `npx --no-install eslint src/components/whiteboard src/utils/toWhiteboardPart.ts src/app/lesson/page.tsx`.
