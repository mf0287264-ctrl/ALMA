# Lesson whiteboard

Whiteboards are part of **My Lessons** at `/my-lessons`, inside the existing student sidebar and course/module library. The five default boards appear in **Whiteboard essentials**, with detailed authored checkpoints, and remain available when the course API is offline. Practice links use `/my-lessons/player?sample=lesson-loops`; saved academy lessons use `/my-lessons/player?lessonId=<id>`. An optional `section=0` selects a section and `autoplay=1` starts playback.

`/lesson` redirects to the same player. Existing `/lesson?lesson=0&section=0` links still resolve the old lesson index and open the matching lesson by ID. Login behavior is unchanged.

The shared lesson player preserves single-section and multi-section content, selects the published version when present, and combines the board, reading notes, authored diagnostic checks, explanations and remediation. The generic frontend checkpoint generator has been removed. Watch/Read controls stop narration when leaving the board. Completed questions and the current section are saved on this device, scoped to the student and lesson version. Course selection is retained on return to the library. Practice completion stays local; real lesson completion uses the existing achievement endpoint.

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

Future generation requests receive `whiteboard_generation` defaults from `src/Whiteboard/generationDefaults.js`, including an explanatory animation policy, detailed checkpoint requirements, limits, and a valid sample storyboard. Lesson create/update compiles `whiteboard.plan`, `whiteboard_plan`, or `board` plans before storage, including unversioned sections. Sections with reading blocks and no storyboard receive a board automatically. Supported two-line Python range/print loops get a loop animation, including negative steps and value-only output. Other source is described and highlighted without executing arbitrary code or inventing unknown output.

Compiler v3 derives operation explanations from actual algorithm values: assignment and output, search bounds and comparisons, sorting passes and resulting arrays, and collection removal order and size. The board displays matching state indicators. On read, older editable boards without recorded audio are recompiled with the current compiler; existing recorded audio keeps its original timeline. Reading does not update database records.

The existing Python variables, loops and functions sources now contain more detailed questions and feedback. `src/Seed/lessonDocuments.js` builds their documents and adds verified loop traces when source and supplied output agree. `npm run seed:lessons` updates the existing seeded curriculum by its original course/module/topic keys when the database is available.

## Generation studio

`/teacher/ai-generation` follows actual backend job status and previews the saved lesson's real boards and questions. The old timed progress simulation, fabricated draft, mock credential fields and simulated PDF analysis have been replaced with a lesson specification form and reference notes.

Set `GEMINI_API_KEY` on the backend and optionally `GEMINI_MODEL` (default `gemini-2.5-flash`). New pending jobs run in the backend process: outline, section authoring, structural/animation validation with one repair attempt, independent model review of worked examples, and draft storage. Detailed question wording, distinct options, specific distractor feedback, prediction-before-reveal and remediation are required. A model review helps assess content; it is not a substitute for teacher review. The draft starts as `AWAITING_REVIEW` and only appears in the student library after approval. Approve and revision actions save the real version state.

Keys are backend configuration and are not stored with job metadata. Without a configured provider, the job reports a connection failure instead of simulating completion. `LESSON_GENERATION_EXTERNAL_WORKER=1` keeps requests pending for an external worker. The built-in worker runs in-process; use an external worker for durable processing across server restarts. Live generation requires a connected backend database and model provider.

The `algorithm` layout automatically fills in missing spoken operational steps from its actual values and operations. It emits `step_times` and `end_time` so comparisons, swaps, and collection operations follow caption boundaries. Existing `flow`, `code`, `trace`, and `boxes` layouts now include meaningful data or execution transfers by default. The compiler reserves enough time for a movement before the next spoken step and for the entire algorithm before clearing the page.

Run `node --test tests/whiteboard.test.mjs tests/lesson-player.test.mjs tests/lesson-generation.test.mjs tests/lessons-merge.test.mjs` from the repository root with Node 24 or newer. From `alma_frontend`, run `npx --no-install tsc --noEmit --incremental false` and ESLint on the lesson pages, generation studio, lesson components and whiteboard components. Generation tests use an injected model response and do not call a live provider.
