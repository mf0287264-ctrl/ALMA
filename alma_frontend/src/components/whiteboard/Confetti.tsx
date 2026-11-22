import type { CSSProperties } from "react";
import { ACCENTS } from "./theme";
import "./whiteboard.css";

/**
 * A short burst of confetti that falls inside its nearest positioned parent.
 * Deterministic on purpose (no randomness), so it renders the same on server and client.
 */
export default function Confetti({ pieces = 30, fall = 260 }: { pieces?: number; fall?: number }) {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {Array.from({ length: pieces }, (_, i) => (
        <span
          key={i}
          className="wb-confetti"
          style={
            {
              left: `${(i * 37 + 11) % 100}%`,
              background: ACCENTS[i % ACCENTS.length],
              "--d": `${(i % 7) * 70}ms`,
              "--fall": `${fall * 0.7 + ((i * 53) % 100) * (fall / 250)}px`,
              "--drift": `${((i * 29) % 80) - 40}px`,
              "--spin": `${360 + ((i * 71) % 360)}deg`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
