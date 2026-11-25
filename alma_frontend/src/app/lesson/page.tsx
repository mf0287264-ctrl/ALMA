"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MangoIcon from "@/components/MangoIcon";
import { PRACTICE_LESSON_SUMMARIES } from "@/components/whiteboard/practiceLessons";
import { lessonPlayerHref } from "@/utils/toPlayerLesson";
import api from "@/services/api";

/** Preserve old whiteboard links while using the same player as My Lessons. */
function LegacyLessonLink() {
  const params = useSearchParams();
  const router = useRouter();
  const [error, setError] = useState("");
  const legacyIndex = params.get("lesson");
  const section = params.get("section");
  const autoplay = params.get("autoplay");

  useEffect(() => {
    const controller = new AbortController();
    async function open() {
      try {
        let href = lessonPlayerHref(PRACTICE_LESSON_SUMMARIES[0]);
        if (legacyIndex !== null) {
          const index = Number(legacyIndex);
          if (!Number.isInteger(index) || index < 0)
            throw new Error("Choose a lesson from My Lessons to continue.");
          const response = await api.get("/lessons", {
            signal: controller.signal,
          });
          const lesson = response.data?.data?.[index];
          if (!lesson?._id)
            throw new Error(
              "This academy lesson is unavailable. Choose a lesson from My Lessons.",
            );
          href = lessonPlayerHref(lesson);
        }
        if (section !== null) href += `&section=${encodeURIComponent(section)}`;
        if (autoplay === "1") href += "&autoplay=1";
        if (!controller.signal.aborted) router.replace(href);
      } catch {
        if (!controller.signal.aborted)
          setError(
            "We couldn’t open this link. All your whiteboards are now in My Lessons.",
          );
      }
    }
    void open();
    return () => controller.abort();
  }, [legacyIndex, section, autoplay, router]);

  return (
    <div className="flex min-h-screen bg-[#fff8ec]">
      <Sidebar />
      <main className="flex min-w-0 flex-1 flex-col items-center justify-center gap-4 p-6 text-center">
        <MangoIcon size={64} animated />
        <p role="status" className="text-sm font-semibold text-[#607274]">
          {error || "Opening your whiteboard in My Lessons…"}
        </p>
        {error && (
          <Link
            href="/my-lessons"
            className="rounded-full bg-[#ffa11f] px-5 py-2.5 text-xs font-bold text-[#10292e]"
          >
            Go to My Lessons
          </Link>
        )}
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#fff8ec] p-8 text-[#607274]">
          Opening your lesson…
        </div>
      }
    >
      <LegacyLessonLink />
    </Suspense>
  );
}
