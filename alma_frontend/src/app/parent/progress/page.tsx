"use client";

import React, { useEffect, useState } from "react";
import api from "@/services/api";

interface ChildProgressData {
  _id: string;
  student_id: string;
  first_name: string;
  last_name: string;
  grade_level?: string;
  student_code?: string;
  checkpoint_accuracy?: number;
  checkpoints_correct?: number;
  checkpoints_total?: number;
  struggling_concepts?: Array<{
    concept_id: string;
    concept_label: string;
    times_tested?: number;
    times_wrong?: number;
    last_diagnosed_misconception?: string | null;
  }>;
}

export default function ParentProgressPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [progressData, setProgressData] = useState<ChildProgressData | null>(null);
  const [loading, setLoading] = useState(true);

  const loadChildren = async () => {
    try {
      const res = await api.get("/parents/children");
      const kids = res.data?.data || [];
      setChildren(kids);
      if (kids.length > 0) {
        setSelectedChildId(kids[0]._id || kids[0].student_id);
      }
    } catch {
      setChildren([]);
    }
  };

  const loadChildProgress = async (cid: string) => {
    setLoading(true);
    try {
      const res = await api.get(`/parents/child/${cid}/progress`);
      setProgressData(res.data?.data || null);
    } catch {
      setProgressData(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadChildren();
  }, []);

  useEffect(() => {
    if (selectedChildId) {
      loadChildProgress(selectedChildId);
    }
  }, [selectedChildId]);

  const activeChild =
    children.find((c) => (c._id || c.student_id) === selectedChildId) || children[0];

  const childName = activeChild
    ? `${activeChild.first_name} ${activeChild.last_name}`
    : "Layla Hassan";

  const initials = (first?: string, last?: string) =>
    `${(first || "S")[0]}${(last || "K")[0]}`.toUpperCase();

  const concepts = progressData?.struggling_concepts?.length
    ? progressData.struggling_concepts
    : [
        {
          concept_id: "zero_indexing",
          concept_label: "Zero-Based Indexing",
          times_tested: 25,
          times_wrong: 13,
          last_diagnosed_misconception: "Thinks range() starts at 1",
        },
        {
          concept_id: "loop_stop_condition",
          concept_label: "Loop stop condition",
          times_tested: 24,
          times_wrong: 9,
          last_diagnosed_misconception: "Forgets the exit condition",
        },
        {
          concept_id: "off_by_one",
          concept_label: "Off-by-one in range()",
          times_tested: 15,
          times_wrong: 4,
          last_diagnosed_misconception: "Confuses the stop value",
        },
      ];

  const accuracy = progressData?.checkpoint_accuracy ?? 82;
  const correctCount = progressData?.checkpoints_correct ?? 9;
  const totalCount = progressData?.checkpoints_total ?? 11;

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#10292e]">
            Progress
          </h1>
          <p className="text-sm md:text-base text-[#607274] mt-1 font-medium">
            Learning progress for {childName}.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto text-xs font-semibold">
          <span className="text-[#8a999b]">Sample data</span>
          <span className="bg-[#e6f5f2] text-[#118a80] px-2.5 py-0.5 rounded-full">
            Existing
          </span>
          <span className="border border-dashed border-[#f25c78] text-[#f25c78] bg-[#fff0f3] px-2.5 py-0.5 rounded-full">
            Proposed
          </span>
        </div>
      </div>

      {/* Child Selector Pills */}
      {children.length > 0 && (
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-bold text-[#8a999b] uppercase tracking-wider">
            Viewing
          </span>
          {children.map((child) => {
            const cid = child._id || child.student_id;
            const isSelected = cid === (activeChild?._id || activeChild?.student_id);
            return (
              <button
                key={cid}
                onClick={() => setSelectedChildId(cid)}
                className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-[#fff7ee] text-[#10292e] border-2 border-[#ffa11f] shadow-xs"
                    : "bg-white text-[#607274] border border-[#e8eeea] hover:border-[#ffa11f]/60"
                }`}
              >
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                    child.first_name === "Layla"
                      ? "bg-[#f3e8ff] text-[#9333ea]"
                      : "bg-[#e2f7ed] text-[#118a80]"
                  }`}
                >
                  {initials(child.first_name, child.last_name)}
                </span>
                <span>
                  {child.first_name} {child.last_name}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Top Cards: Course Progress & Checkpoint Accuracy */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Python Basics Course Progress Card */}
        <div className="lg:col-span-8 bg-white rounded-3xl p-6 md:p-8 border border-[#ece8de] shadow-2xs space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-extrabold text-[#10292e]">Python Basics</h2>
            <span className="bg-[#e6f5f2] text-[#118a80] text-[10px] font-bold px-2 py-0.5 rounded-full">
              Existing
            </span>
          </div>

          {/* Overall progress bar */}
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-[#7f9092] mb-2">
              <span>Overall progress</span>
              <span>38% · from sessions</span>
            </div>
            <div className="w-full bg-[#f4f1e9] h-3.5 rounded-full overflow-hidden">
              <div
                style={{ width: "38%" }}
                className="bg-[#118a80] h-full rounded-full transition-all duration-500"
              />
            </div>
          </div>

          {/* Module items */}
          <div className="space-y-3 pt-2">
            {/* Module 1 */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#fffcf7] border border-[#f0ede4]">
              <div>
                <p className="font-extrabold text-sm text-[#10292e]">
                  Module 1 · Variables
                </p>
                <p className="text-xs text-[#7f9092] mt-0.5">2 of 2 lessons</p>
              </div>
              <span className="bg-[#e6f5f2] text-[#118a80] text-xs font-bold px-3 py-1 rounded-full">
                completed
              </span>
            </div>

            {/* Module 2 */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#fffcf7] border border-[#f0ede4]">
              <div>
                <p className="font-extrabold text-sm text-[#10292e]">
                  Module 2 · Loops
                </p>
                <p className="text-xs text-[#7f9092] mt-0.5">1 of 3 · in progress</p>
              </div>
              <span className="bg-[#e6f5f2] text-[#118a80] text-xs font-bold px-3 py-1 rounded-full">
                active
              </span>
            </div>

            {/* Module 3 */}
            <div className="flex items-center justify-between p-4 rounded-2xl bg-[#fffcf7] border border-[#f0ede4]">
              <div>
                <p className="font-extrabold text-sm text-[#10292e]">
                  Module 3 · Functions
                </p>
                <p className="text-xs text-[#7f9092] mt-0.5">0 of 2 lessons</p>
              </div>
              <span className="bg-[#f4f1e9] text-[#7f9092] text-xs font-bold px-3 py-1 rounded-full">
                not started
              </span>
            </div>
          </div>
        </div>

        {/* Checkpoint Accuracy Card */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-6 md:p-8 border border-[#ece8de] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-[#10292e]">
                Checkpoint accuracy
              </h2>
              <span className="bg-[#e6f5f2] text-[#118a80] text-[10px] font-bold px-2 py-0.5 rounded-full">
                Existing
              </span>
            </div>
            <p className="text-xs text-[#7f9092] mt-1 font-medium">
              From checkpoint_logs.is_correct
            </p>
          </div>

          <div className="my-8 text-center">
            <span className="text-6xl md:text-7xl font-black text-[#10292e] tracking-tight">
              {accuracy}%
            </span>
            <p className="text-sm font-bold text-[#7f9092] mt-3">
              {correctCount} of {totalCount} answers correct
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#fffcf7] border border-[#f0ede4] text-center text-xs text-[#7f9092]">
            Adaptive checkpoint telemetry tracks concept understanding in real time.
          </div>
        </div>
      </div>

      {/* Concepts To Practice Card */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#ece8de] shadow-2xs space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-[#10292e]">Concepts to practice</h2>
          <span className="bg-[#e6f5f2] text-[#118a80] text-[10px] font-bold px-2 py-0.5 rounded-full">
            Existing
          </span>
        </div>

        <div className="space-y-4">
          {concepts.map((concept) => {
            const wrong = concept.times_wrong ?? 10;
            const tested = concept.times_tested ?? 25;
            const wrongPercent = tested > 0 ? (wrong / tested) * 100 : 40;

            return (
              <div
                key={concept.concept_id}
                className="flex flex-col md:flex-row md:items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#fffcf7] border border-[#f0ede4] gap-4"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-sm md:text-base text-[#10292e]">
                    {concept.concept_label}
                  </h3>
                  <p className="text-xs text-[#7f9092] mt-1">
                    tested {tested} · wrong {wrong}
                    {concept.last_diagnosed_misconception
                      ? ` · last: ${concept.last_diagnosed_misconception}`
                      : ""}
                  </p>
                </div>

                <div className="w-full md:w-56 shrink-0">
                  <div className="w-full bg-[#e8eeea] h-3 rounded-full overflow-hidden flex">
                    <div
                      style={{ width: `${wrongPercent}%` }}
                      className="bg-[#f25c78] h-full rounded-l-full"
                    />
                    <div
                      style={{ width: `${100 - wrongPercent}%` }}
                      className="bg-[#118a80] h-full rounded-r-full"
                    />
                  </div>
                  <div className="flex justify-between text-[10px] font-bold text-[#8a999b] mt-1">
                    <span>{wrong} struggles</span>
                    <span>{tested - wrong} mastered</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
