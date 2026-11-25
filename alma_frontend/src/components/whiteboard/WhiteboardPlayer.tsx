"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from "react";
import { ArrowRight, Check, Pause, Play, RotateCcw } from "lucide-react";
import type { Payload, WhiteboardPart } from "@/types/Whiteboard.type";
import { toWhiteboardPart } from "@/utils/toWhiteboardPart";
import CaptionBubble from "./CaptionBubble";
import PlayerControls, { formatTime } from "./PlayerControls";
import PredictPrompt from "./PredictPrompt";
import { getBoardState, getCaptions, getChapters, type Chapter } from "./playback";
import { useLessonClock } from "./useLessonClock";
import { useNarration } from "./useNarration";
import Whiteboard from "./Whiteboard";
import Confetti from "./Confetti";
import { useAudioNarration } from "./useAudioNarration";

interface WhiteboardPlayerProps {
  /** A lesson part ({ scenes }), a full lesson ({ parts }) or a generator visual_sequence. */
  lesson: unknown;
  /** Start playing as soon as the board is shown. */
  autoplay?: boolean;
  /** The student pressed play. */
  onPlay?: () => void;
  /** The part reached its end. */
  onEnd?: () => void;
  /** Let the lesson page distinguish finishing the board from passing its checkpoint. */
  endTitle?: string;
  endDescription?: string;
  onContinue?: () => void;
  continueLabel?: string;
  /**
   * Handle sandbox_question scenes yourself. The lesson pauses; return a promise to resume
   * when it resolves. Without this prop the player shows its own "your turn" card.
   */
  onSandboxQuestion?: (payload: Payload, sceneId: string) => void | Promise<void>;
  /** Adds an "Ask ALMA" button to every sentence. */
  onAsk?: (sentence: string) => void;
}

/** Plays one lesson part: board, ALMA's captions and the controls. */
export default function WhiteboardPlayer({ lesson, ...rest }: WhiteboardPlayerProps) {
  const part = useMemo(() => toWhiteboardPart(lesson), [lesson]);
  // A different part remounts the player, which resets the clock, the voice and the questions.
  return <Player key={JSON.stringify(part)} part={part} {...rest} />;
}

function Player({
  part,
  autoplay,
  onPlay,
  onEnd,
  endTitle = "Section complete",
  endDescription = "Replay a chapter or try the lesson again.",
  onContinue,
  continueLabel = "Continue",
  onSandboxQuestion,
  onAsk,
}: Omit<WhiteboardPlayerProps, "lesson"> & { part: WhiteboardPart }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const captions = useMemo(() => getCaptions(part.scenes), [part.scenes]);
  const chapters = useMemo(() => getChapters(part.scenes), [part.scenes]);
  const gates = useMemo(() => captions.slice(1).map((caption) => caption.time), [captions]);
  const speaking = useRef(false);

  const [voiceOn, setVoiceOn] = useState(true);
  const [fullscreen, setFullscreen] = useState(false);
  const [answered, setAnswered] = useState<string[]>([]);
  const [motion, setMotion] = useState(true);
  const [grid, setGrid] = useState(true);
  const [transcript, setTranscript] = useState(false);
  const [hostFallback, setHostFallback] = useState<string | null>(null);
  const stops = useMemo(() => part.scenes.filter((scene) => scene.action_type === "sandbox_question" && !answered.includes(scene.id)).map((scene) => scene.time_offset), [part.scenes, answered]);
  const [flash, setFlash] = useState<{ id: number; playing: boolean } | null>(null);

  const { elapsed, status, speed, timeline, play, pause, seek, restart, setSpeed } = useLessonClock({
    duration: part.duration_seconds,
    autoplay,
    gates,
    stops,
    isHeld: () => speaking.current,
    onEnd,
  });

  const board = useMemo(() => getBoardState(part.scenes, elapsed), [part.scenes, elapsed]);
  const playing = status === "playing";
  const isIdle = status === "idle" && elapsed === 0;
  const talking = playing && board.caption !== null;

  const recorded = useAudioNarration({ url: part.audio_url, elapsed, playing, enabled: voiceOn, speed, revision: timeline.revision });
  useNarration({ captions, elapsed, playing, enabled: voiceOn && !recorded, speed, speakingRef: speaking, revision: timeline.revision, narration: captions.length ? null : part.narration });

  /* ---------------------------------------------------------- questions */

  // A question is "open" right after the lesson reaches it, until the student continues.
  const reached = board.sandbox && elapsed - board.sandbox.time_offset < 0.1 ? board.sandbox : null;
  const question = reached && !answered.includes(reached.id) ? reached : null;
  const handedToHost = useRef<{ id: string; result: Promise<void> | null } | null>(null);

  useEffect(() => {
    if (!question) {
      handedToHost.current = null;
      return;
    }
    pause();
    if (!onSandboxQuestion) return;
    if (handedToHost.current?.id !== question.id) {
      try {
        const result = onSandboxQuestion(question.payload, question.id);
        handedToHost.current = { id: question.id, result: result ? Promise.resolve(result) : null };
      } catch { handedToHost.current = { id: question.id, result: null }; }
    }
    let cancelled = false;
    const result = handedToHost.current.result;
    if (result) {
      void result.then(() => {
        if (cancelled) return;
        setAnswered((list) => [...new Set([...list, question.id])]);
        play();
      }).catch(() => { if (!cancelled) setHostFallback(question.id); });
    } else queueMicrotask(() => { if (!cancelled) setHostFallback(question.id); });
    return () => { cancelled = true; };
  }, [question, onSandboxQuestion, pause, play]);

  useEffect(() => {
    if (!flash) return;
    const timer = setTimeout(() => setFlash(null), 750);
    return () => clearTimeout(timer);
  }, [flash]);

  const continueAfterQuestion = () => {
    if (question) setAnswered((list) => [...list, question.id]);
    onPlay?.();
    play();
  };

  /* ------------------------------------------------------------ actions */

  const start = () => {
    if (question) return;
    if (status === "ended") setAnswered([]);
    onPlay?.();
    play();
  };
  const toggle = () => (playing ? pause() : start());

  const jumpTo = (time: number) => {
    seek(time);
    onPlay?.();
    play();
  };

  /** Previous / next sentence. "Previous" first restarts the sentence you are in. */
  const step = (direction: 1 | -1) => {
    const current = captions.filter((caption) => caption.time <= elapsed).length - 1;
    const restartsCurrent = direction === -1 && current >= 0 && elapsed - captions[current].time > 1.5;
    const target = direction === 1 ? current + 1 : restartsCurrent ? current : current - 1;

    if (target < 0) seek(0);
    else if (target >= captions.length) seek(part.duration_seconds);
    else seek(captions[target].time + 0.01);
  };

  const clickBoard = () => {
    if (question || isIdle) return;
    toggle();
    setFlash({ id: Date.now(), playing: !playing });
  };

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen?.().catch(() => {});
    else void containerRef.current?.requestFullscreen?.().catch(() => {});
  };

  useEffect(() => {
    const sync = () => setFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", sync);
    return () => document.removeEventListener("fullscreenchange", sync);
  }, []);

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.altKey || event.ctrlKey || event.metaKey || (event.target as HTMLElement).closest("input, select, button, textarea, a, [contenteditable=true]")) return;
    const key = event.key.toLowerCase();

    if (key === " " || key === "k") toggle();
    else if (key === "arrowright") step(1);
    else if (key === "arrowleft") step(-1);
    else if (key === "l") seek(elapsed + 5);
    else if (key === "j") seek(elapsed - 5);
    else if (key === "m") setVoiceOn((on) => !on);
    else if (key === "f") toggleFullscreen();
    else if (/^[1-9]$/.test(key) && chapters[Number(key) - 1]) jumpTo(chapters[Number(key) - 1].time + 0.05);
    else return;
    event.preventDefault();
  };

  const jumpToChapter = (chapter: Chapter) => jumpTo(chapter.time + 0.05);

  /* ------------------------------------------------------------- render */

  return (
    <div
      ref={containerRef}
      className={`wb-player w-full rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#ffa11f] ${motion ? "" : "wb-motion-off"} ${fullscreen ? "flex flex-col justify-center overflow-y-auto bg-[#fff8ec] p-3 sm:p-6" : ""}`}
      style={{ "--wb-rate": speed } as CSSProperties}
      tabIndex={0}
      onKeyDown={onKeyDown}
      aria-label="Lesson whiteboard player"
    >
      <div
        className="mx-auto w-full"
        style={fullscreen ? { maxWidth: "min(100%, calc((100vh - 300px) * 1.6))" } : undefined}
      >
        <Whiteboard
          scenes={board.visible}
          elapsed={elapsed}
          zoom={board.zoom}
          currentSince={board.currentSince}
          glow={playing}
          pen={playing ? board.pen : null}
          onClick={clickBoard}
          playing={playing}
          motion={motion}
          grid={grid}
          speed={speed}
          animateAfter={timeline.animateAfter}
          revision={timeline.revision}
          pageId={board.pageId}
          pageTime={board.pageTime}
          focus={board.focus}
        >
          {isIdle && (
            <button
              type="button"
              onClick={(event) => {
                event.stopPropagation();
                start();
              }}
              className="absolute inset-0 z-10 flex cursor-pointer flex-col items-center justify-center gap-3 bg-white/80 backdrop-blur-[2px] transition-colors hover:bg-white/65"
              aria-label={`Play ${part.title}`}
            >
              <span className="relative flex h-16 w-16 items-center justify-center">
                <span className="wb-play-beacon absolute inset-0 rounded-full bg-[#ffa11f]/40" />
                <span className="relative flex h-16 w-16 items-center justify-center rounded-full bg-[#ffa11f] text-[#10292e] shadow-md">
                  <Play className="h-7 w-7 translate-x-0.5 fill-current" />
                </span>
              </span>
              <span className="text-base font-extrabold text-[#10292e]">{part.title}</span>
              <span className="text-xs font-medium text-[#607274]">
                ALMA draws and explains · about {formatTime(part.duration_seconds)}
              </span>
            </button>
          )}

          {flash && (
            <div key={flash.id} className="wb-flash pointer-events-none absolute inset-0 flex items-center justify-center" onAnimationEnd={() => setFlash(null)} aria-hidden>
              <span className="rounded-full bg-[#10292e]/70 p-5 text-white">
                {flash.playing ? <Play className="h-8 w-8 translate-x-0.5 fill-current" /> : <Pause className="h-8 w-8 fill-current" />}
              </span>
            </div>
          )}

          {status === "ended" && !question && (
            <div className="wb-panel-in absolute inset-0 z-10 flex flex-col items-center justify-center gap-2 bg-white/90 p-3 text-center backdrop-blur-[2px] sm:gap-3 sm:p-4">
              <Confetti pieces={36} fall={380} />
              <span className="wb-success-pop rounded-full bg-[#e6f5f2] p-2 text-[#118a80] sm:p-4"><Check className="h-6 w-6 sm:h-9 sm:w-9" /></span>
              <p className="text-base font-extrabold text-[#10292e] sm:text-lg">{endTitle}</p>
              <p className="max-w-sm text-xs text-[#607274] sm:text-sm">{endDescription}</p>
              {onContinue && <button type="button" onClick={(event) => { event.stopPropagation(); onContinue(); }} className="flex cursor-pointer items-center gap-2 rounded-full bg-[#10292e] px-4 py-2 text-xs font-bold text-white sm:px-5 sm:py-2.5"><ArrowRight className="h-3.5 w-3.5" />{continueLabel}</button>}
              <button type="button" onClick={(event) => { event.stopPropagation(); start(); }} className="flex cursor-pointer items-center gap-2 rounded-full bg-[#ffa11f] px-4 py-2 text-xs font-bold text-[#10292e] sm:px-5 sm:py-2.5 sm:text-sm"><RotateCcw className="h-4 w-4" /> Replay lesson</button>
            </div>
          )}
        </Whiteboard>

        {question && (!onSandboxQuestion || hostFallback === question.id) && (
          <PredictPrompt key={question.id} payload={question.payload} onContinue={continueAfterQuestion} />
        )}

        <CaptionBubble
          caption={board.caption}
          elapsed={elapsed}
          talking={talking}
          placeholder={isIdle ? "Press play and I will teach this step by step." : "\u00a0"}
          onReplay={() => board.caption && jumpTo(board.caption.time + 0.01)}
          onAsk={onAsk}
        />

        <PlayerControls
          playing={playing}
          ended={status === "ended"}
          elapsed={elapsed}
          duration={part.duration_seconds}
          speed={speed}
          voiceOn={voiceOn}
          fullscreen={fullscreen}
          chapters={chapters}
          motion={motion}
          grid={grid}
          transcript={transcript}
          onMotion={() => setMotion((value) => !value)}
          onGrid={() => setGrid((value) => !value)}
          onTranscript={() => setTranscript((value) => !value)}
          onToggle={toggle}
          onRestart={() => {
            onPlay?.();
            setAnswered([]);
            restart();
          }}
          onSeek={seek}
          onPrevious={() => step(-1)}
          onNext={() => step(1)}
          onSpeed={setSpeed}
          onVoice={() => setVoiceOn((on) => !on)}
          onFullscreen={toggleFullscreen}
          onChapter={jumpToChapter}
        />
        {transcript && (
          <div className="wb-panel-in mt-3 max-h-64 overflow-y-auto rounded-2xl border border-[#e8eeea] bg-white p-4" aria-label="Lesson transcript">
            <p className="mb-2 text-xs font-extrabold uppercase tracking-wide text-[#607274]">Transcript · select a sentence to replay</p>
            {captions.length ? captions.map((caption, index) => (
              <button key={`${caption.time}-${index}`} type="button" onClick={() => jumpTo(caption.time + 0.01)} className={`mb-1 flex w-full cursor-pointer gap-3 rounded-xl p-2 text-left text-sm hover:bg-[#fff8ec] ${board.caption?.time === caption.time ? "bg-[#fff3db] text-[#10292e]" : "text-[#607274]"}`} aria-current={board.caption?.time === caption.time ? "true" : undefined}>
                <span className="shrink-0 font-mono text-xs">{formatTime(caption.time)}</span><span>{caption.text}</span>
              </button>
            )) : <p className="text-sm text-[#607274]">{part.narration || "This lesson has no narration."}</p>}
          </div>
        )}
      </div>
    </div>
  );
}

