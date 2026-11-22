"use client";

import { useEffect, type MutableRefObject } from "react";

interface NarrationOptions {
  /** One sentence per caption, in time order. */
  captions: { time: number; text: string }[];
  elapsed: number;
  playing: boolean;
  /** false = muted: the board still plays, just without a voice. */
  enabled: boolean;
  speed: number;
  /** True while a sentence is being spoken. The clock waits on it. */
  speakingRef: MutableRefObject<boolean>;
  revision?: number;
  narration?: string | null;
}

const PREFERRED_VOICES = ["Samantha", "Google US English", "Microsoft Aria", "Microsoft Jenny", "Karen", "Daniel"];

function pickVoice(synth: SpeechSynthesis): SpeechSynthesisVoice | null {
  const english = synth.getVoices().filter((voice) => /^en[-_]/i.test(voice.lang));
  for (const name of PREFERRED_VOICES) {
    const match = english.find((voice) => voice.name.includes(name));
    if (match) return match;
  }
  return english[0] ?? null;
}

/** Index of the latest caption that has started, or -1. */
function activeCaption(captions: NarrationOptions["captions"], elapsed: number) {
  let active = -1;
  for (let i = 0; i < captions.length; i++) {
    if (captions[i].time <= elapsed) active = i;
  }
  return active;
}

/**
 * Reads each caption aloud with the browser voice when it appears.
 * Pausing stops the voice; playing again repeats the current sentence.
 */
export function useNarration({ captions, elapsed, playing, enabled, speed, speakingRef, revision = 0, narration }: NarrationOptions) {
  const active = activeCaption(captions, elapsed);

  useEffect(() => {
    speakingRef.current = false;
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;

    if (!playing || !enabled || (active < 0 && !narration)) {
      synth.cancel();
      speakingRef.current = false;
      return;
    }

    const text = active >= 0 ? captions[active].text : narration!;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US";
    utterance.rate = Math.min(2, Math.max(0.5, speed));
    utterance.voice = pickVoice(synth);

    let disposed = false;
    const finish = () => { if (!disposed) speakingRef.current = false; };
    utterance.onend = finish;
    utterance.onerror = finish;

    synth.cancel();
    speakingRef.current = true;
    // Browsers can drop a sentence spoken right after cancel(), so wait a moment.
    const start = setTimeout(() => synth.speak(utterance), 60);
    // Never hold the lesson longer than the sentence can reasonably take.
    const safety = setTimeout(finish, (Math.max(4, text.split(/\s+/).length * 0.7) * 1000) / speed);

    return () => {
      disposed = true;
      clearTimeout(start);
      clearTimeout(safety);
      synth.cancel();
      speakingRef.current = false;
    };
  }, [active, captions, playing, enabled, speed, speakingRef, revision, narration]);
}
