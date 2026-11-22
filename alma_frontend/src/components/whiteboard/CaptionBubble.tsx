"use client";

import { MessageCircle } from "lucide-react";
import MangoIcon from "@/components/MangoIcon";
import type { Caption } from "./playback";
import "./whiteboard.css";

interface CaptionBubbleProps {
  caption: Caption | null;
  elapsed: number;
  /** ALMA is speaking: the mascot sways and the words light up as they are said. */
  talking: boolean;
  /** Shown when there is no caption yet. */
  placeholder: string;
  /** Clicking the sentence plays it again. */
  onReplay: () => void;
  /** Adds an "Ask ALMA" button that sends the current sentence to the chat. */
  onAsk?: (sentence: string) => void;
}

/** What ALMA is saying right now, with the mascot and a progress dot per sentence. */
export default function CaptionBubble({ caption, elapsed, talking, placeholder, onReplay, onAsk }: CaptionBubbleProps) {
  const words = caption ? caption.text.split(/\s+/).filter(Boolean) : [];

  // Words light up in step with the sentence (timed from how long it stays on screen).
  const lit = !caption
    ? 0
    : talking
      ? Math.min(words.length, Math.floor(((elapsed - caption.time) / (caption.duration * 0.8)) * words.length) + 1)
      : words.length;

  return (
    <div className="mt-3 flex min-h-[76px] items-center gap-3 rounded-2xl border border-[#fae2b8] bg-[#fff8ec] px-4 py-3">
      {/* New sentence = the mascot hops once */}
      <div key={caption?.time ?? "none"} className={`shrink-0 ${caption ? "wb-hop" : ""}`}>
        <div className={talking ? "wb-talk" : ""}>
          <MangoIcon size={38} animated={talking} />
        </div>
      </div>

      <button
        type="button"
        onClick={onReplay}
        disabled={!caption}
        className="min-w-0 flex-1 cursor-pointer text-left disabled:cursor-default"
        title={caption ? "Click to hear this sentence again" : undefined}
      >
        <span className="sr-only" aria-live="polite">{caption?.text ?? placeholder}</span>
        <p className="text-sm font-semibold leading-relaxed" aria-hidden>
          {caption
            ? words.map((word, i) => (
                <span key={i} className={`transition-colors duration-200 ${i < lit ? "text-[#10292e]" : "text-[#10292e]/45"}`}>
                  {word}{" "}
                </span>
              ))
            : placeholder}
        </p>
        {caption && caption.total > 1 && (
          <span className="mt-1.5 flex gap-1" aria-hidden>
            {Array.from({ length: Math.min(caption.total, 12) }).map((_, i) => (
              <span
                key={i}
                className={`h-1 w-4 rounded-full transition-colors ${i <= caption.index ? "bg-[#ffa11f]" : "bg-[#fae2b8]"}`}
              />
            ))}
          </span>
        )}
      </button>

      {caption && onAsk && (
        <button
          type="button"
          onClick={() => onAsk(caption.text)}
          className="flex shrink-0 cursor-pointer items-center gap-1.5 rounded-full border border-[#d2ede7] bg-[#e6f5f2] px-3 py-1.5 text-[11px] font-bold text-[#118a80] transition-colors hover:bg-[#d2ede7]"
          title="Ask ALMA about this sentence"
        >
          <MessageCircle className="h-3.5 w-3.5" />
          Ask ALMA
        </button>
      )}
    </div>
  );
}
