"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type ClockStatus = "idle" | "playing" | "paused" | "ended";

interface ClockOptions {
  duration: number;
  autoplay?: boolean;
  /** Caption boundaries wait for narration. */
  gates?: number[];
  /** Unanswered exercises stop exactly at their timestamp, even at 2× speed. */
  stops?: number[];
  isHeld?: () => boolean;
  onEnd?: () => void;
}

export function useLessonClock({ duration, autoplay = false, gates = [], stops = [], isHeld, onEnd }: ClockOptions) {
  const [elapsed, setElapsed] = useState(0);
  const [status, setStatus] = useState<ClockStatus>(autoplay ? "playing" : "idle");
  const [speed, updateSpeed] = useState(1);
  const [timeline, setTimeline] = useState({ revision: 0, animateAfter: -1 });
  const live = useRef({ elapsed: 0, speed, gates, stops, isHeld, onEnd, running: autoplay });
  useEffect(() => {
    Object.assign(live.current, { speed, gates, stops, isHeld, onEnd });
  });

  useEffect(() => {
    if (status !== "playing") return;
    let last = performance.now();
    const timer = setInterval(() => {
      const now = performance.now();
      const step = Math.min(0.5, (now - last) / 1000) * live.current.speed;
      last = now;
      if (!live.current.running || document.hidden) return;
      const current = live.current.elapsed;
      let next = current + step;
      const stop = live.current.stops.find((time) => time > current && time <= next);
      const gate = live.current.gates.find((time) => time > current && time <= next);
      if (gate !== undefined && live.current.isHeld?.()) next = Math.max(current, gate - 0.001);
      if (stop !== undefined && stop <= next) {
        next = stop;
        live.current.running = false;
        setStatus("paused");
      }
      if (next >= duration) {
        // Let the final sentence finish as well as the earlier sentences.
        if (live.current.isHeld?.()) next = Math.max(current, duration - 0.001);
        else {
          next = duration;
          live.current.running = false;
          setStatus("ended");
          live.current.onEnd?.();
        }
      }
      live.current.elapsed = next;
      setElapsed(next);
    }, 50);
    return () => clearInterval(timer);
  }, [status, duration]);

  const seek = useCallback((time: number) => {
    if (!Number.isFinite(time)) return;
    const target = Math.min(Math.max(time, 0), duration);
    live.current.elapsed = target;
    setElapsed(target);
    setTimeline((previous) => ({ revision: previous.revision + 1, animateAfter: target }));
    if (target >= duration) {
      live.current.running = false;
      setStatus("ended");
    } else setStatus((previous) => previous === "ended" || previous === "idle" ? "paused" : previous);
  }, [duration]);

  const play = useCallback(() => {
    if (live.current.elapsed >= duration) {
      live.current.elapsed = 0;
      setElapsed(0);
      setTimeline((previous) => ({ revision: previous.revision + 1, animateAfter: -1 }));
    }
    live.current.running = true;
    setStatus("playing");
  }, [duration]);

  const pause = useCallback(() => {
    live.current.running = false;
    setStatus((previous) => previous === "playing" ? "paused" : previous);
  }, []);

  const restart = useCallback(() => {
    live.current.elapsed = 0;
    live.current.running = true;
    setElapsed(0);
    setTimeline((previous) => ({ revision: previous.revision + 1, animateAfter: -1 }));
    setStatus("playing");
  }, []);

  const setSpeed = useCallback((value: number) => {
    if (Number.isFinite(value)) updateSpeed(Math.min(2, Math.max(0.5, value)));
  }, []);

  return { elapsed, status, speed, timeline, setSpeed, play, pause, seek, restart };
}
