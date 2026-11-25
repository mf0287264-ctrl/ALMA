import type { Payload, WhiteboardPart, WhiteboardScene } from "@/types/Whiteboard.type";

const scene = (time: number, type: string, payload: Payload): WhiteboardScene => ({ id: `${type}-${time}`, time_offset: time, action_type: type, payload });
const chapter = (time: number, title: string) => scene(time, "clear", { title });
const caption = (time: number, content: string) => scene(time, "draw_caption", { content, estimatedDurationSeconds: 5 });
const heading = (time: number, content: string) => scene(time, "draw_text", { content, position: [40, 58], style: { fontSize: 28, fontWeight: 800 } });

/** Default lessons are available immediately, including when the academy API is offline. */
export const DEFAULT_LESSONS: WhiteboardPart[] = [
  {
    id: "lesson-loops", title: "Python loops, drawn step by step", narration: null, audio_url: null, duration_seconds: 36,
    scenes: [
      chapter(0, "Read the code"), heading(0.2, "One loop. Three greetings."),
      caption(0.4, "A for loop repeats the indented code once for each value in a sequence."),
      scene(1, "draw_code_block", { code: 'for i in range(3):\n    print("Hello", i)', position: [45, 112], width: 415, active_line: 1 }),
      scene(2.2, "draw_object", { object_type: "cycle", position: [540, 112], size: [155, 145], label: "Repeat" }),
      scene(3.3, "draw_arrow", { from: [530, 188], to: [470, 188], style: { color: "#118a80" } }),
      caption(6, "Range three gives us zero, one, and two. The stopping value is excluded."),
      scene(6.3, "draw_array", { values: [0, 1, 2], position: [45, 318], width: 415, active_index: 0, label: "range(3)" }),
      scene(7.5, "draw_callout", { content: "Predict the last line of output.", position: [505, 326], width: 230 }),
      scene(10.5, "sandbox_question", { title: "Trace the loop", instructions: 'The loop uses range(3) and prints "Hello" followed by i once per iteration. range starts at 0 and excludes 3. Before watching the animation, write all three output lines in order, one per line.', code: 'for i in range(3):\n    print("Hello", i)', hint: 'Track i as 0, then 1, then 2. Each iteration prints one line.', explanation: 'range(3) supplies exactly 0, 1 and 2. The print inside the loop runs once for each value, producing three lines in that order.', testCases: [{ expectedOutput: "Hello 0\nHello 1\nHello 2" }] }),
      chapter(12, "Follow each iteration"), heading(12.2, "The computer follows the same steps."),
      caption(12.4, "Each iteration picks the next value, then prints Hello and that value."),
      scene(13, "animate_loop", { values: [0, 1, 2], step_seconds: 2, prefix: "Hello" }),
      caption(19, "After the third iteration, there are no values left. The loop is finished."),
      scene(19.5, "draw_badge", { content: "3 values → 3 iterations", position: [220, 372] }),
      chapter(24, "Remember the pattern"), heading(24.2, "Pick → run → repeat"),
      caption(24.4, "Pick a value, run the body, and repeat until the sequence has no values left."),
      scene(25, "draw_flowchart", { position: [65, 190], nodes: [{ id: "a", label: "Pick next value", kind: "terminal" }, { id: "b", label: "Run loop body" }, { id: "c", label: "More values?", kind: "decision" }, { id: "d", label: "Finish", kind: "terminal" }], edges: [{ from: "a", to: "b" }, { from: "b", to: "c" }, { from: "c", to: "d", label: "No" }] }),
      caption(30, "You can replay any chapter, change the speed, or read the transcript at your own pace."),
      scene(30.4, "draw_callout", { content: "Try changing range(3) to range(5). How many greetings would you get?", position: [145, 340], width: 510 }),
    ],
  },
  {
    id: "lesson-structures", title: "Arrays, stacks and queues", narration: null, audio_url: null, duration_seconds: 27,
    scenes: [
      chapter(0, "Array"), heading(0.2, "Every value has an address."),
      caption(0.4, "An array keeps values in order. An index tells you where to find each value."),
      scene(1, "draw_array", { values: ["A", "B", "C", "D", "E"], position: [80, 190], width: 640, active_index: 2 }),
      scene(3, "draw_callout", { content: "Index 2 points to C. Counting starts at zero.", position: [170, 330], width: 450 }),
      chapter(9, "Stack"), heading(9.2, "A stack takes the newest value first."),
      caption(9.4, "Think of a stack of plates. The last plate added is the first one you take off."),
      scene(10, "animate_stack", { values: [], step_seconds: 2.2, operations: [{ type: "push", value: "First" }, { type: "push", value: "Second" }, { type: "pop" }] }),
      chapter(18, "Queue"), heading(18.2, "A queue serves the earliest value first."),
      caption(18.4, "A queue works like a line at a shop. The first person to arrive is served first."),
      scene(19, "animate_queue", { values: [], step_seconds: 2, operations: [{ type: "enqueue", value: "First" }, { type: "enqueue", value: "Second" }, { type: "dequeue" }] }),
    ],
  },
  {
    id: "lesson-motion", title: "Charts and science in motion", narration: null, audio_url: null, duration_seconds: 28,
    scenes: [
      chapter(0, "Bar and line charts"), heading(0.2, "Make the numbers visible."),
      caption(0.4, "Bar charts compare values. Values below zero grow below the baseline."),
      scene(1, "draw_graph", { title: "Change in score", position: [65, 142], size: [285, 210], data: { values: [4, -2, 7, 3], labels: ["A", "B", "C", "D"] } }),
      scene(2.4, "draw_graph", { title: "Progress over time", graph_type: "line", position: [455, 142], size: [270, 210], data: { values: [1, 3, 2, 6], labels: ["1", "2", "3", "4"] } }),
      chapter(9, "Coordinates"), heading(9.2, "A point has two coordinates."),
      caption(9.4, "The horizontal axis gives x. The vertical axis gives y. Negative values go left or down."),
      scene(10, "draw_coordinate_system", { origin: [380, 280], size: [440, 280], plot_points: [[-4, -2], [-2, 1], [0, 0], [2, 3], [4, 2]] }),
      chapter(18, "Pendulum and waves"), heading(18.2, "Motion has a pattern."),
      caption(18.4, "A pendulum swings around a fixed point. A wave repeats its shape through space."),
      scene(19, "draw_physics_shape", { shape_type: "pendulum", position: [100, 160], size: [230, 210], label: "Pendulum" }),
      scene(20.2, "draw_physics_shape", { shape_type: "wave", position: [435, 170], size: [275, 180], label: "Wave" }),
      scene(23, "draw_badge", { content: "Observe · predict · explain", position: [255, 433] }),
    ],
  },
  {
    id: "lesson-search", title: "Searching: follow the comparisons", narration: null, audio_url: null, duration_seconds: 27,
    scenes: [
      chapter(0, "Linear search"), heading(0.2, "Look at one value at a time."),
      caption(0.4, "Linear search checks each value in order. Follow the pointer until it finds ten."),
      scene(1, "animate_search", { values: [2, 4, 6, 8, 10, 12, 14], target: 10, step_seconds: 2 }),
      caption(7, "The pointer has to visit earlier positions before it can reach the target."),
      chapter(12, "Binary search"), heading(12.2, "A sorted sequence lets us skip half."),
      caption(12.4, "Binary search compares the middle value. If it is too small, discard everything to the left."),
      scene(13, "animate_search", { values: [2, 4, 6, 8, 10, 12, 14], target: 12, strategy: "binary", step_seconds: 3.2 }),
      caption(20, "Watch the candidate range shrink. Twelve is found after only two comparisons."),
    ],
  },
  {
    id: "lesson-sort", title: "Sorting: compare, swap, repeat", narration: null, audio_url: null, duration_seconds: 30,
    scenes: [
      chapter(0, "Compare and swap"), heading(0.2, "Put the smaller neighbor first."),
      caption(0.4, "Bubble sort compares neighboring values. If the left value is larger, the pair trades places."),
      scene(1, "animate_sort", { values: [4, 2, 5, 1], step_seconds: 2.5 }),
      caption(7, "Each swap moves a larger value to the right. The largest value settles at the end."),
      caption(13, "Repeat over the remaining unsorted values until every pair is in order."),
      chapter(19, "Try another sequence"), heading(19.2, "Which pairs need to move?"),
      caption(19.4, "Now follow three values. Notice that an already ordered pair stays in place."),
      scene(20, "animate_sort", { values: [3, 1, 2], step_seconds: 2.5 }),
    ],
  },
];

export const DEFAULT_LESSON_LABELS = ["Python loops", "Data structures", "Charts & motion", "Searching", "Sorting"];
