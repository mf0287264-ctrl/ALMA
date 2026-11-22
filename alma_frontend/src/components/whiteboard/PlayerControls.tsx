"use client";

import { Check, FileText, Grid2X2, Maximize, Minimize, Pause, Play, RotateCcw, SkipBack, SkipForward, Sparkles, Volume2, VolumeX } from "lucide-react";
import type { Chapter } from "./playback";
import "./whiteboard.css";

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export const formatTime = (seconds: number) => {
  const whole = Number.isFinite(seconds) ? Math.max(0, Math.floor(seconds)) : 0;
  return `${Math.floor(whole / 60)}:${String(whole % 60).padStart(2, "0")}`;
};

interface PlayerControlsProps {
  playing: boolean;
  ended: boolean;
  elapsed: number;
  duration: number;
  speed: number;
  voiceOn: boolean;
  fullscreen: boolean;
  chapters: Chapter[];
  onToggle: () => void;
  onRestart: () => void;
  onSeek: (seconds: number) => void;
  onPrevious: () => void;
  onNext: () => void;
  onSpeed: (speed: number) => void;
  onVoice: () => void;
  onFullscreen: () => void;
  onChapter: (chapter: Chapter) => void;
  motion: boolean;
  grid: boolean;
  transcript: boolean;
  onMotion: () => void;
  onGrid: () => void;
  onTranscript: () => void;
}

const roundButton =
  "flex shrink-0 cursor-pointer items-center justify-center rounded-full border border-[#e8eeea] bg-white text-[#607274] transition-colors hover:text-[#10292e]";

/** Play, step, seek, speed, voice and fullscreen, plus one pill per beat of the lesson part. */
export default function PlayerControls({
  playing,
  ended,
  elapsed,
  duration,
  speed,
  voiceOn,
  fullscreen,
  chapters,
  onToggle,
  onRestart,
  onSeek,
  onPrevious,
  onNext,
  onSpeed,
  onVoice,
  onFullscreen,
  onChapter,
  motion, grid, transcript, onMotion, onGrid, onTranscript,
}: PlayerControlsProps) {
  const progress = duration > 0 ? Math.min(100, (elapsed / duration) * 100) : 0;

  return (
    <div className="mt-3 rounded-2xl border border-[#f0f0eb] bg-[#fafaf8] p-3">
      {/* Seek bar */}
      <div className="flex items-center gap-3">
        <span className="w-9 text-right font-mono text-[11px] tabular-nums text-[#8a999b]">{formatTime(elapsed)}</span>
        <div className="relative flex min-w-0 flex-1 items-center">
        <input
          type="range"
          className="wb-range min-w-0 flex-1"
          min={0}
          max={duration}
          step={0.1}
          value={Math.min(elapsed, duration)}
          onChange={(event) => onSeek(Number(event.target.value))}
          style={{ background: `linear-gradient(to right, #118a80 ${progress}%, #e8eeea ${progress}%)` }}
          aria-label="Seek in the lesson"
          aria-valuetext={`${formatTime(elapsed)} of ${formatTime(duration)}`}
        />
        <div className="pointer-events-none absolute inset-x-0 flex items-center" aria-hidden>
          {chapters.slice(1).map((chapter, index) => <span key={index} className="absolute h-2 w-0.5 rounded-full bg-white/90" style={{ left: `${duration > 0 ? (chapter.time / duration) * 100 : 0}%` }} />)}
        </div>
        </div>
        <span className="w-9 font-mono text-[11px] tabular-nums text-[#8a999b]">{formatTime(duration)}</span>
      </div>

      {/* Buttons */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2.5">
        <div className="flex items-center gap-2.5">
          <button type="button" onClick={onPrevious} className={`${roundButton} h-8 w-8`} aria-label="Previous sentence" title="Previous sentence (←)">
            <SkipBack className="h-3.5 w-3.5" />
          </button>

          <button
            type="button"
            onClick={onToggle}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-[#ffa11f] text-[#10292e] shadow-xs transition-all hover:scale-105 hover:bg-[#ff9400] active:scale-95"
            aria-label={playing ? "Pause" : ended ? "Replay" : "Play"}
            title={playing ? "Pause (space)" : "Play (space)"}
          >
            {playing ? (
              <Pause className="h-4 w-4 fill-current" />
            ) : ended ? (
              <RotateCcw className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4 translate-x-0.5 fill-current" />
            )}
          </button>

          <button type="button" onClick={onNext} className={`${roundButton} h-8 w-8`} aria-label="Next sentence" title="Next sentence (→)">
            <SkipForward className="h-3.5 w-3.5" />
          </button>

          <button type="button" onClick={onRestart} className={`${roundButton} h-8 w-8`} aria-label="Start again" title="Start again">
            <RotateCcw className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="flex items-center gap-2.5">
          <select
            value={speed}
            onChange={(event) => onSpeed(Number(event.target.value))}
            className="cursor-pointer rounded-full border border-[#e8eeea] bg-white px-2.5 py-1 text-xs font-bold text-[#10292e]"
            aria-label="Playback speed"
          >
            {SPEEDS.map((value) => (
              <option key={value} value={value}>
                {value}×
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={onVoice}
            className={`flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-colors ${
              voiceOn ? "border-[#d2ede7] bg-[#e6f5f2] text-[#118a80]" : "border-[#e8eeea] bg-white text-[#8a999b]"
            }`}
            aria-label={voiceOn ? "Turn ALMA's voice off" : "Turn ALMA's voice on"}
            aria-pressed={voiceOn}
            title={voiceOn ? "Voice on (m)" : "Voice off (m)"}
          >
            {voiceOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
          </button>

          <button
            type="button"
            onClick={onFullscreen}
            className={`${roundButton} h-8 w-8`}
            aria-label={fullscreen ? "Leave full screen" : "Full screen"}
            title={fullscreen ? "Leave full screen (f)" : "Full screen (f)"}
            disabled={typeof document !== "undefined" && !document.fullscreenEnabled}
          >
            {fullscreen ? <Minimize className="h-4 w-4" /> : <Maximize className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-[#e8eeea] pt-2.5">
        {[
          { label: "Animations", icon: Sparkles, active: motion, action: onMotion },
          { label: "Grid", icon: Grid2X2, active: grid, action: onGrid },
          { label: "Transcript", icon: FileText, active: transcript, action: onTranscript },
        ].map(({ label, icon: Icon, active, action }) => (
          <button key={label} type="button" onClick={action} aria-pressed={active} className={`flex cursor-pointer items-center gap-1.5 rounded-full px-2.5 py-1.5 text-[11px] font-bold transition-colors ${active ? "bg-[#e6f5f2] text-[#118a80]" : "bg-white text-[#607274]"}`}>
            <Icon className="h-3.5 w-3.5" />{label}
          </button>
        ))}
        <span className="ml-auto hidden text-[10px] text-[#8a999b] sm:block">Space play/pause · ← → step · M voice · F fullscreen</span>
      </div>

      {chapters.length > 1 && (
        <nav className="mt-3 flex flex-wrap gap-2" aria-label="Parts of this section">
          {chapters.map((chapter, i) => {
            const end = chapters[i + 1]?.time ?? Infinity;
            const active = elapsed >= chapter.time && elapsed < end;
            const done = elapsed >= end;
            return (
              <button
                key={`${chapter.time}-${i}`}
                type="button"
                aria-current={active ? "step" : undefined}
                onClick={() => onChapter(chapter)}
                title={`Jump to: ${chapter.title}`}
                className={`flex max-w-[13rem] cursor-pointer items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-bold transition-all hover:-translate-y-0.5 ${
                  active
                    ? "border-[#ffa11f] bg-[#fff3db] text-[#10292e] shadow-xs"
                    : done
                      ? "border-[#d2ede7] bg-[#e6f5f2] text-[#118a80]"
                      : "border-[#e8eeea] bg-white text-[#607274]"
                }`}
              >
                <span
                  className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-black ${
                    active ? "bg-[#ffa11f] text-[#10292e]" : done ? "bg-[#118a80] text-white" : "bg-[#f0f0eb] text-[#8a999b]"
                  }`}
                >
                  {done ? <Check className="h-2.5 w-2.5" /> : i + 1}
                </span>
                <span className="truncate">{chapter.title}</span>
              </button>
            );
          })}
        </nav>
      )}
    </div>
  );
}
