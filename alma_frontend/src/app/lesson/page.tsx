"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { ArrowRight, BookOpen, Sparkles } from "lucide-react";
import { WhiteboardPlayer } from "@/components/whiteboard";
import { DEFAULT_LESSONS, DEFAULT_LESSON_LABELS } from "@/components/whiteboard/defaultLessons";

interface Section { title: string; whiteboard?: { scenes: unknown[]; duration_seconds: number } | null }
interface Lesson { _id: string; topic: string; versions?: { sections?: Section[] }[] }
const validIndex = (value: string | null) => Math.max(0, Math.floor(Number(value) || 0));

function LessonPage() {
  const params = useSearchParams();
  const router = useRouter();
  const [sample, setSample] = useState(0);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadAcademy, setLoadAcademy] = useState(false);
  const [error, setError] = useState("");
  const requestedLesson = params.get("lesson");
  const [selection, setSelection] = useState<{ lesson: number; section: number } | null>(null);
  const lessonIndex = selection?.lesson ?? validIndex(requestedLesson);
  const sectionIndex = selection?.section ?? validIndex(params.get("section"));
  const useAcademy = loadAcademy || requestedLesson !== null;

  useEffect(() => {
    if (!useAcademy) return;
    const controller = new AbortController();
    const base = process.env.NEXT_PUBLIC_BASE_API || process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
    axios.get(`${base.replace(/\/$/, "")}/lessons`, { signal: controller.signal }).then((res) => {
      if (!Array.isArray(res.data?.data)) throw new Error("Invalid lesson response");
      setLessons(res.data.data);
    }).catch(() => { if (!controller.signal.aborted) setError("Academy lessons are unavailable. You can still try every default lesson below."); });
    return () => controller.abort();
  }, [useAcademy]);

  const academyLesson = lessons[lessonIndex];
  const sections = academyLesson?.versions?.[0]?.sections ?? [];
  const section = sections[sectionIndex];
  const active = useAcademy && section?.whiteboard ? { ...section.whiteboard, id: `${academyLesson._id}-${sectionIndex}`, title: section.title } : DEFAULT_LESSONS[sample];

  return (
    <main className="min-h-screen bg-[#fff8ec] px-4 py-8 sm:px-8 sm:py-12">
      <div className="mx-auto max-w-[960px]">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#fae2b8] bg-white px-3 py-1.5 text-xs font-bold text-[#118a80]"><Sparkles className="h-3.5 w-3.5" /> ALMA Whiteboard</div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#10292e] sm:text-4xl">Watch an idea come to life.</h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-[#607274]">Follow the drawings, hear each explanation, and pause to try it yourself. Pick a lesson to get started.</p>
        <div className="my-6 flex flex-wrap gap-2" aria-label="Lessons">
          {DEFAULT_LESSONS.map((lesson, index) => <button key={lesson.id} type="button" onClick={() => { setSample(index); setLoadAcademy(false); setSelection(null); if (requestedLesson !== null) router.replace("/lesson"); }} aria-pressed={!useAcademy && sample === index} className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2.5 text-xs font-bold transition-colors ${!useAcademy && sample === index ? "border-[#10292e] bg-[#10292e] text-white" : "border-[#e8eeea] bg-white text-[#607274] hover:border-[#ffa11f]"}`}>
            <BookOpen className="h-3.5 w-3.5" />{DEFAULT_LESSON_LABELS[index]}
          </button>)}
          <button type="button" onClick={() => setLoadAcademy(true)} className="flex cursor-pointer items-center gap-1 rounded-full px-3 py-2 text-xs font-bold text-[#118a80] hover:bg-[#e6f5f2]">Academy lessons <ArrowRight className="h-3.5 w-3.5" /></button>
        </div>
        {error && <p role="status" className="mb-4 rounded-xl border border-[#fae2b8] bg-white p-3 text-sm text-[#607274]">{error}</p>}
        {useAcademy && !error && !lessons.length && <p role="status" className="mb-4 text-sm text-[#607274]">Loading academy lessons…</p>}
        {useAcademy && lessons.length > 0 && <div className="mb-4 flex flex-wrap gap-3">
          <select value={lessonIndex} onChange={(event) => setSelection({ lesson: Number(event.target.value), section: 0 })} aria-label="Academy lesson" className="max-w-full rounded-xl border border-[#e8eeea] bg-white px-3 py-2 text-sm text-[#10292e]">{lessons.map((lesson, index) => <option key={lesson._id} value={index}>{lesson.topic}</option>)}</select>
          <select value={sectionIndex} onChange={(event) => setSelection({ lesson: lessonIndex, section: Number(event.target.value) })} aria-label="Lesson section" className="max-w-full rounded-xl border border-[#e8eeea] bg-white px-3 py-2 text-sm text-[#10292e]">{sections.map((item, index) => <option key={index} value={index}>{item.title}</option>)}</select>
          {!section?.whiteboard && <p role="status" className="w-full text-xs text-[#607274]">This section has no whiteboard yet. Showing a default lesson.</p>}
        </div>}
        <div className="rounded-3xl border border-[#fae2b8] bg-white/60 p-3 shadow-sm sm:p-5">
          <WhiteboardPlayer lesson={active} autoplay={params.get("autoplay") === "1"} />
        </div>
        <p className="mt-5 text-center text-xs leading-relaxed text-[#607274]">Set your own pace. Use the transcript to revisit a sentence, or turn animations off whenever you prefer.</p>
      </div>
    </main>
  );
}

export default function Page() {
  return <Suspense fallback={<div className="min-h-screen bg-[#fff8ec] p-8 text-[#607274]">Opening the whiteboard…</div>}><LessonPage /></Suspense>;
}
