"use client";

import { useState } from "react";
import { Check, ChevronRight, Eye } from "lucide-react";
import type { Payload } from "@/types/Whiteboard.type";
import Confetti from "./Confetti";
import "./whiteboard.css";

type Result = "asking" | "wrong" | "right" | "shown";

/** Ignore surrounding whitespace; preserve case and punctuation in program output. */
const normalize = (value: string) => value.replace(/\r\n/g, "\n").trim();

interface PredictPromptProps {
  /** A sandbox_question payload: { title, instructions, testCases: [{ expectedOutput }] } */
  payload: Payload;
  /** The student is done (answered or looked at the answer). */
  onContinue: () => void;
}

/**
 * "Your turn": the lesson pauses and asks the student to predict what the code prints.
 * Used for sandbox_question scenes when the host app does not handle them itself.
 */
export default function PredictPrompt({ payload, onContinue }: PredictPromptProps) {
  const cases = Array.isArray(payload.testCases) ? (payload.testCases as { expectedOutput?: unknown }[]) : [];
  const expected = String(cases[0]?.expectedOutput ?? "");

  const [guess, setGuess] = useState("");
  const [result, setResult] = useState<Result>("asking");
  const [misses, setMisses] = useState(0);
  const finished = result === "right" || result === "shown";

  const check = () => {
    if (!guess.trim() || finished) return;
    if (expected && normalize(guess) === normalize(expected)) {
      setResult("right");
    } else {
      setResult("wrong");
      setMisses((n) => n + 1);
    }
  };

  return (
    <div
      className="relative z-10 mt-3 cursor-default"
      onClick={(event) => event.stopPropagation()}
    >
      {/* A wrong answer remounts the card (new key), which replays the shake. */}
      <div
        role="region"
        aria-label="Your turn"
        className="wb-panel-in relative overflow-hidden rounded-2xl border border-[#fae2b8] bg-white p-4 shadow-lg"
      >
        {result === "right" && <Confetti pieces={26} fall={150} />}

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-[#ffa11f] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-[#10292e]">
            {String(payload.title ?? "Your turn")}
          </span>
          <p className="text-sm font-extrabold text-[#10292e]">{String(payload.instructions ?? "What do you think happens?")}</p>
        </div>

        <form className="mt-3 flex gap-2" onSubmit={(event) => { event.preventDefault(); check(); }}>
          <textarea
            autoFocus
            rows={expected.includes("\n") ? 3 : 1}
            value={guess}
            onChange={(event) => setGuess(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey && !expected.includes("\n")) { event.preventDefault(); check(); } }}
            disabled={finished}
            placeholder="Type your guess..."
            aria-label="Your guess"
            className="min-w-0 flex-1 resize-none rounded-xl border border-[#e8eeea] bg-[#fafaf8] px-3 py-2 font-mono text-sm text-[#10292e] placeholder-[#8a999b] focus:border-[#ffa11f] focus:outline-hidden disabled:opacity-60"
          />
          <button
            type="submit"
            disabled={!guess.trim() || finished || !expected}
            className="cursor-pointer rounded-full bg-[#ffa11f] px-5 text-xs font-extrabold text-[#10292e] transition-colors hover:bg-[#ff9400] disabled:cursor-not-allowed disabled:opacity-50"
          >
            Check
          </button>
        </form>

        <div className="mt-3 flex min-h-8 flex-wrap items-center justify-between gap-2">
          <p
            key={misses}
            className={`text-xs font-bold ${result === "right" ? "text-[#118a80]" : result === "wrong" ? "wb-shake text-[#f25c78]" : "text-[#607274]"}`}
            aria-live="polite"
          >
            {result === "asking" && (expected ? "Think like the computer, then press Check." : "Try the exercise, then continue when you are ready.")}
            {result === "wrong" && "Not quite. Look at the code again and try once more."}
            {result === "right" && (
              <span className="inline-flex items-center gap-1">
                <Check className="h-4 w-4" /> Yes! That is exactly what it prints.
              </span>
            )}
            {result === "shown" && (
              <span>
                It prints: <code className="rounded bg-[#e6f5f2] px-1.5 py-0.5 font-mono text-[#118a80]">{expected.replace(/\n/g, "  ")}</code>
              </span>
            )}
          </p>

          <div className="flex gap-2">
            {!finished && expected && (
              <button
                type="button"
                onClick={() => setResult("shown")}
                className="flex cursor-pointer items-center gap-1 rounded-full border border-[#e8eeea] bg-white px-3.5 py-1.5 text-xs font-bold text-[#607274] transition-colors hover:text-[#10292e]"
              >
                <Eye className="h-3.5 w-3.5" /> Show me
              </button>
            )}
            {(finished || !expected) && (
              <button
                type="button"
                onClick={onContinue}
                className="flex cursor-pointer items-center gap-1 rounded-full bg-[#10292e] px-4 py-1.5 text-xs font-extrabold text-white transition-colors hover:bg-[#0b1a1c]"
              >
                Continue <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
