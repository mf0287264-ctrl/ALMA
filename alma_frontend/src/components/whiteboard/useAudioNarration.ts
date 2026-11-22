"use client";

import { useEffect, useRef, useState } from "react";

/** Plays a supplied recording; falls back to browser narration if it cannot play. */
export function useAudioNarration({ url, elapsed, playing, enabled, speed, revision }: {
  url: string | null; elapsed: number; playing: boolean; enabled: boolean; speed: number; revision: number;
}) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [failed, setFailed] = useState(false);
  const latest = useRef({ elapsed, playing, enabled, speed });
  useEffect(() => { latest.current = { elapsed, playing, enabled, speed }; });

  useEffect(() => {
    if (!url) return;
    const audio = new Audio(url);
    audio.preload = "metadata";
    audioRef.current = audio;
    const fail = () => setFailed(true);
    const loaded = () => { audio.currentTime = latest.current.elapsed; };
    const visibility = () => {
      if (document.hidden) audio.pause();
      else if (latest.current.playing) {
        audio.currentTime = latest.current.elapsed;
        void audio.play().catch(fail);
      }
    };
    audio.addEventListener("error", fail);
    audio.addEventListener("loadedmetadata", loaded);
    document.addEventListener("visibilitychange", visibility);
    return () => {
      audio.pause();
      audio.removeEventListener("error", fail);
      audio.removeEventListener("loadedmetadata", loaded);
      document.removeEventListener("visibilitychange", visibility);
      audio.removeAttribute("src");
      audio.load();
      audioRef.current = null;
    };
  }, [url]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || failed) return;
    audio.playbackRate = speed;
    audio.muted = !enabled;
    if (Math.abs(audio.currentTime - latest.current.elapsed) > 0.35) audio.currentTime = latest.current.elapsed;
    if (playing && !document.hidden) void audio.play().catch(() => setFailed(true));
    else audio.pause();
  }, [url, playing, enabled, speed, revision, failed]);

  return !!url && !failed;
}
