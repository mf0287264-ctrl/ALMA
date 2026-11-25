"use client";

import { useState } from "react";
import { Check, CheckCircle2, Lightbulb, RotateCcw } from "lucide-react";
import type { LessonSection } from "@/types/Lesson.type";
import LessonBlocks from "./LessonBlocks";

export default function LessonCheckpoint({
  section,
  passedAnswer,
  onPass,
}: {
  section: LessonSection;
  passedAnswer?: string;
  onPass: (answer: string) => void;
}) {
  const check = section.diagnostic_check!;
  const [selected, setSelected] = useState(passedAnswer ?? "");
  const [result, setResult] = useState<"correct" | "incorrect" | null>(
    passedAnswer ? "correct" : null,
  );
  const [hint, setHint] = useState(false);
  const passed = result === "correct";
  const feedback = check.misconception_map?.[selected];

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (!selected || passed) return;
    if (selected === check.correct_answer) {
      setResult("correct");
      onPass(selected);
    } else {
      setResult("incorrect");
      setHint(true);
    }
  }

  return (
    <section
      className="rounded-3xl border border-[#e8eeea] bg-white p-5 shadow-xs sm:p-6"
      aria-labelledby="checkpoint-heading"
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e6f5f2] text-[#118a80]">
            <Lightbulb className="h-4 w-4" />
          </span>
          <h2
            id="checkpoint-heading"
            className="text-base font-extrabold text-[#10292e]"
          >
            Check your understanding
          </h2>
        </div>
        {passed && (
          <span className="inline-flex items-center gap-1 rounded-full bg-[#e6f5f2] px-2.5 py-1 text-[11px] font-bold text-[#118a80]">
            <Check className="h-3 w-3" /> Completed
          </span>
        )}
      </div>
      <form onSubmit={submit}>
        <fieldset disabled={passed}>
          <legend className="mb-4 w-full whitespace-pre-line text-sm font-semibold leading-7 text-[#10292e]">
            {check.question_text}
          </legend>
          {check.code_snippet && (
            <pre className="mb-4 overflow-x-auto rounded-2xl bg-[#0b1a1c] p-4 font-mono text-xs leading-6 text-[#a4efb3]">
              <code>{check.code_snippet}</code>
            </pre>
          )}
          <div className="space-y-2.5">
            {check.options.map((option, index) => {
              const chosen = selected === option;
              return (
                <label
                  key={`${index}-${option}`}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 transition-colors sm:p-4 ${passed && chosen ? "border-[#118a80] bg-[#e6f5f2]" : chosen ? "border-[#ffa11f] bg-[#fff8ec]" : "border-[#e8eeea] bg-[#fafaf8] hover:border-[#d1ded7]"}`}
                >
                  <input
                    type="radio"
                    name="checkpoint-answer"
                    value={option}
                    checked={chosen}
                    onChange={() => {
                      setSelected(option);
                      setResult(null);
                    }}
                    className="mt-1 h-4 w-4 shrink-0 accent-[#118a80]"
                  />
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md bg-white text-[10px] font-extrabold text-[#607274]">
                    {String.fromCharCode(65 + index)}
                  </span>
                  <span
                    className={`min-w-0 whitespace-pre-wrap text-sm leading-6 text-[#10292e] ${option.includes("\n") ? "font-mono text-xs" : ""}`}
                  >
                    {option}
                  </span>
                </label>
              );
            })}
          </div>
        </fieldset>
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setHint((value) => !value)}
            aria-expanded={hint}
            className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-bold text-[#118a80]"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            {hint ? "Hide lesson hint" : "Need a hint?"}
          </button>
          {!passed && (
            <button
              type="submit"
              disabled={!selected}
              className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-[#10292e] px-5 py-2.5 text-xs font-bold text-white transition-colors hover:bg-[#1b3438] disabled:cursor-not-allowed disabled:opacity-40"
            >
              {result === "incorrect" && <RotateCcw className="h-3.5 w-3.5" />}
              Check answer
            </button>
          )}
        </div>
      </form>
      {result && (
        <div
          role="status"
          className={`mt-4 rounded-2xl border p-4 ${passed ? "border-[#d2ede7] bg-[#e6f5f2]" : "border-[#fae2b8] bg-[#fff8ec]"}`}
        >
          <p className="mb-1 flex items-center gap-1.5 text-sm font-bold text-[#10292e]">
            {passed && <CheckCircle2 className="h-4 w-4 text-[#118a80]" />}
            {passed ? "Exactly. Here’s why." : "Let’s trace that step again."}
          </p>
          <p className="whitespace-pre-line text-sm leading-7 text-[#607274]">
            {passed
              ? check.explanation
              : feedback ||
                "Review the worked example below. Follow each step in order, then compare the result with your chosen answer."}
          </p>
        </div>
      )}
      {hint && !passed && (
        <div className="mt-4 rounded-2xl border border-dashed border-[#d2ede7] bg-[#f3faf7] p-4">
          <p className="mb-2 text-xs font-extrabold text-[#118a80]">
            A little help from ALMA
          </p>
          <LessonBlocks
            blocks={
              section.remediation_blocks?.length
                ? section.remediation_blocks
                : [{ type: "paragraph", text: check.explanation }]
            }
          />
        </div>
      )}
    </section>
  );
}
