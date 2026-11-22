"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import MangoIcon from "@/components/MangoIcon";
import api from "@/services/api";
import { Check, Play, Pause, Mic, Send, Volume2, ArrowLeft, Loader2, AlertCircle, Sparkles, Trophy } from "lucide-react";
import { toast } from "sonner";

interface ContentBlock {
  type: "paragraph" | "code" | "callout" | "list";
  text?: string | null;
  callout_type?: "tip" | "warning" | "note" | null;
  items?: string[];
  language?: string;
  code?: string | null;
  expected_output?: string | null;
}

interface DiagnosticCheck {
  concept_tag?: string | null;
  question_text: string;
  code_snippet?: string | null;
  options: string[];
  correct_answer: string;
  misconception_map?: Record<string, string>;
  explanation: string;
}

interface SectionData {
  order: number;
  title: string;
  purpose?: string;
  covers_objectives?: string[];
  blocks?: ContentBlock[];
  diagnostic_check?: DiagnosticCheck | null;
  remediation_blocks?: ContentBlock[];
}

interface SpeechSegment {
  order_in_lesson: number;
  title: string;
  narration_text: string;
  est_seconds: number;
  attached_code?: string | null;
}

interface FullLesson {
  _id: string;
  topic: string;
  title?: string;
  programming_language?: string;
  grade_level?: string;
  course_title?: string;
  module_title?: string;
  target_duration_minutes?: number;
  sections: SectionData[];
  segments?: SpeechSegment[];
}

function generateTopicCheckpoint(topic: string, language: string = "Python"): DiagnosticCheck {
  const t = (topic || "").toLowerCase();

  if (t.includes("variable")) {
    return {
      concept_tag: "variable_assignment",
      question_text: "In Python, which statement correctly stores the integer value 25 into a variable named age?",
      code_snippet: "# Variable Assignment in Python",
      options: ["age = 25", "25 = age", "var age == 25", "int age: 25"],
      correct_answer: "age = 25",
      misconception_map: {
        "25 = age": "The variable name must be on the left side of the '=' assignment operator.",
        "var age == 25": "'==' is an equality check operator, not an assignment operator.",
        "int age: 25": "Python dynamically types variables and does not use 'int' declarations for assignment.",
      },
      explanation: "In Python, assignment binds a value to a variable name using the single '=' sign with the identifier on the left.",
    };
  } else if (t.includes("loop") || t.includes("range")) {
    return {
      concept_tag: "range_iteration",
      question_text: "What numbers does the loop statement `for i in range(4):` generate in order?",
      code_snippet: "for i in range(4):\n    print(i)",
      options: ["0, 1, 2, 3", "1, 2, 3, 4", "0, 1, 2, 3, 4", "1, 2, 3"],
      correct_answer: "0, 1, 2, 3",
      misconception_map: {
        "1, 2, 3, 4": "Python range(n) starts at index 0 by default, not 1.",
        "0, 1, 2, 3, 4": "range(n) stops immediately before reaching n (it is exclusive of the upper bound).",
      },
      explanation: "range(n) generates integers starting at 0 up to n - 1.",
    };
  } else if (t.includes("list") || t.includes("index")) {
    return {
      concept_tag: "zero_indexing",
      question_text: "How do you access the first element in a list called `fruits`?",
      code_snippet: "fruits = ['apple', 'banana', 'orange']",
      options: ["fruits[0]", "fruits[1]", "fruits.first()", "fruits(0)"],
      correct_answer: "fruits[0]",
      misconception_map: {
        "fruits[1]": "Python lists are zero-indexed: the first item is at index 0, and the second is at index 1.",
        "fruits(0)": "List indexing in Python uses square brackets [], not round parentheses ().",
      },
      explanation: "Python sequences use 0-based indexing, so the initial element is accessed with index 0.",
    };
  } else if (t.includes("function") || t.includes("parameter")) {
    return {
      concept_tag: "function_definition",
      question_text: "Which keyword is used to define a reusable function in Python?",
      code_snippet: "# Defining a reusable function\n___ calculate_sum(a, b):\n    return a + b",
      options: ["def", "function", "fn", "define"],
      correct_answer: "def",
      misconception_map: {
        "function": "'function' is used in JavaScript, while Python uses the concise keyword 'def'.",
        "define": "'define' is not a recognized Python keyword.",
      },
      explanation: "In Python, functions are defined using the 'def' keyword followed by the function identifier.",
    };
  } else if (t.includes("condition") || t.includes("if") || t.includes("boolean")) {
    return {
      concept_tag: "boolean_conditionals",
      question_text: "Which operator checks whether two values are equal in an `if` condition?",
      code_snippet: "if score ___ 100:\n    print('Perfect!')",
      options: ["==", "=", "!=", "is equal to"],
      correct_answer: "==",
      misconception_map: {
        "=": "A single '=' is used for assignment, whereas '==' compares two values for equality.",
      },
      explanation: "The double equals '==' operator evaluates if values are equivalent.",
    };
  } else {
    return {
      concept_tag: "algorithmic_thinking",
      question_text: `What is the primary advantage of mastering ${topic}?`,
      options: [
        "Writing modular, predictable code that can be tested and reused",
        "Writing all logic on a single line without formatting",
        "Avoiding data structures and variables entirely",
        "Executing code without reviewing output",
      ],
      correct_answer: "Writing modular, predictable code that can be tested and reused",
      misconception_map: {
        "Writing all logic on a single line without formatting": "Proper formatting, structure, and indentation are essential for readable code.",
      },
      explanation: "Computer science focuses on structuring code so it is readable, efficient, and maintainable.",
    };
  }
}

function LessonPlayerContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const lessonIdFromUrl = searchParams.get("lessonId");

  const [lesson, setLesson] = useState<FullLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedSections, setCompletedSections] = useState<number[]>([]);
  const [completingLesson, setCompletingLesson] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [checkedAnswer, setCheckedAnswer] = useState<boolean | null>(null);
  const [diagnosedMisconception, setDiagnosedMisconception] = useState<string | null>(null);
  const [showRemediation, setShowRemediation] = useState(false);
  const [questionInput, setQuestionInput] = useState("");
  const [chatLogs, setChatLogs] = useState<{ sender: string; tag: string; text: string; isUser: boolean }[]>([]);

  useEffect(() => {
    async function fetchLesson() {
      setLoading(true);
      setError(null);
      try {
        let targetId = lessonIdFromUrl;

        // If no lessonId in URL, fetch available lessons and pick the first one
        if (!targetId) {
          const myRes = await api.get("/lessons/my-lessons");
          const avail = myRes.data?.data?.available_lessons;
          if (avail && avail.length > 0) {
            targetId = avail[0]._id;
          }
        }

        if (!targetId) {
          setError("No lesson ID provided. Please pick a lesson from My Lessons.");
          return;
        }

        const res = await api.get(`/lessons/${targetId}`);
        const data = res.data?.data;
        if (!data) {
          setError("Lesson not found in database.");
          return;
        }

        const topic = data.topic || data.title || "Lesson";
        const lang = data.programming_language || "Python";

        // Build structured sections
        let sections: SectionData[] = [];
        let segments: SpeechSegment[] = [];

        if (data.versions && data.versions.length > 0) {
          const activeVer = data.versions[0];
          const rawSections = activeVer.sections || [];
          segments = activeVer.segments || [];

          if (rawSections.length > 1) {
            // Already multi-section lesson
            sections = rawSections.map((s: any, idx: number) => ({
              ...s,
              diagnostic_check: s.diagnostic_check || (idx === rawSections.length - 1 ? generateTopicCheckpoint(topic, lang) : null),
            }));
          } else {
            // Transform single-section seed into a rich 4-section student progression
            const introBlocks = activeVer.introduction || [
              {
                type: "paragraph",
                text: `Welcome to ${topic}! In this lesson, we will explore core principles and construct working mental models.`,
              },
            ];

            const conceptBlocks = (rawSections[0]?.blocks && rawSections[0].blocks.length > 0)
              ? rawSections[0].blocks
              : [
                  {
                    type: "paragraph",
                    text: `Let's break down ${topic} step by step. Pay close attention to syntax patterns and program flow.`,
                  },
                  {
                    type: "code",
                    language: lang.toLowerCase(),
                    code: `# Example demonstrating ${topic}\nprint("Learning:", "${topic}")`,
                    expected_output: `Learning: ${topic}`,
                  },
                ];

            const conclusionBlocks = activeVer.conclusion || [
              {
                type: "paragraph",
                text: `Great work on completing ${topic}! Continue practicing to solidify your problem-solving skills.`,
              },
            ];

            sections = [
              {
                order: 1,
                title: "Introduction & Context",
                purpose: "Establish foundational concepts",
                blocks: introBlocks,
                diagnostic_check: null,
                remediation_blocks: [],
              },
              {
                order: 2,
                title: "Core Mechanics & Code",
                purpose: "Hands-on code demonstration",
                blocks: conceptBlocks,
                diagnostic_check: null,
                remediation_blocks: [],
              },
              {
                order: 3,
                title: "Diagnostic Checkpoint",
                purpose: "Verify conceptual mastery",
                blocks: [
                  {
                    type: "paragraph",
                    text: "Test your understanding with this diagnostic checkpoint. Select the correct answer below to test your mastery.",
                  },
                ],
                diagnostic_check: rawSections[0]?.diagnostic_check || generateTopicCheckpoint(topic, lang),
                remediation_blocks: [
                  {
                    type: "paragraph",
                    text: `Remember: when working with ${topic}, follow standard language conventions and verify outputs incrementally.`,
                  },
                ],
              },
              {
                order: 4,
                title: "Review & Next Steps",
                purpose: "Lesson recap and consolidation",
                blocks: conclusionBlocks,
                diagnostic_check: null,
                remediation_blocks: [],
              },
            ];
          }
        } else {
          // Fallback 4-section format
          sections = [
            {
              order: 1,
              title: "Introduction",
              purpose: "Foundation",
              blocks: [
                {
                  type: "paragraph",
                  text: `Welcome to ${topic}. In this lesson we establish the core intuition step-by-step.`,
                },
              ],
            },
            {
              order: 2,
              title: "Code Walkthrough",
              purpose: "Syntax and execution",
              blocks: [
                {
                  type: "code",
                  language: lang.toLowerCase(),
                  code: `# Demonstration of ${topic}\nprint("Mastering ${topic}")`,
                  expected_output: `Mastering ${topic}`,
                },
              ],
            },
            {
              order: 3,
              title: "Diagnostic Checkpoint",
              purpose: "Verify mastery",
              diagnostic_check: generateTopicCheckpoint(topic, lang),
            },
            {
              order: 4,
              title: "Wrap-up",
              purpose: "Summary",
              blocks: [
                {
                  type: "paragraph",
                  text: `Congratulations on completing ${topic}!`,
                },
              ],
            },
          ];
        }

        const full: FullLesson = {
          _id: data._id,
          topic,
          title: data.title || topic,
          programming_language: lang,
          grade_level: data.grade_level || "Grade 8",
          course_title: data.course_title || "Platform Course",
          module_title: data.module_title || "Core Module",
          target_duration_minutes: data.target_duration_minutes || 15,
          sections,
          segments,
        };

        setLesson(full);
        setCurrentSectionIndex(0);
        setSelectedOption("");
        setCheckedAnswer(null);
        setShowRemediation(false);
        setDiagnosedMisconception(null);

        // Initial welcome chat message
        setChatLogs([
          {
            sender: "ALMA",
            tag: "tutor",
            text: `Hi! Welcome to "${full.topic}". I'm here to answer any questions and help you with code examples as we proceed!`,
            isUser: false,
          },
        ]);
      } catch (err: any) {
        console.error("Failed to load lesson:", err);
        setError("Could not load lesson data. Please check your connection.");
      } finally {
        setLoading(false);
      }
    }

    fetchLesson();
  }, [lessonIdFromUrl]);

  const activeSection = lesson?.sections[currentSectionIndex] || null;
  const diagnostic = activeSection?.diagnostic_check || null;

  const handleCheckAnswer = () => {
    if (!diagnostic || !selectedOption) return;

    if (selectedOption === diagnostic.correct_answer) {
      setCheckedAnswer(true);
      setShowRemediation(false);
      setDiagnosedMisconception(null);
      toast.success("Correct! Outstanding job.");
      if (!completedSections.includes(currentSectionIndex)) {
        setCompletedSections((prev) => [...prev, currentSectionIndex]);
      }
    } else {
      setCheckedAnswer(false);
      const misconception =
        diagnostic.misconception_map?.[selectedOption] ||
        `Misconception detected: Review the rule for ${diagnostic.concept_tag || "this concept"}.`;
      setDiagnosedMisconception(misconception);
      setShowRemediation(true);
      toast.error("Not quite! ALMA provided targeted feedback below.");
    }
  };

  const handleCompleteLesson = async () => {
    if (!lesson?._id) return;
    try {
      setCompletingLesson(true);
      const res = await api.post(`/lessons/${lesson._id}/complete`);
      if (res.data?.success) {
        if (res.data?.data?.course_awarded) {
          toast.success(res.data.data.message || "Course Completed! You earned a new achievement!", {
            duration: 6000,
          });
        } else {
          toast.success("Lesson completed! Keep up the momentum!");
        }
        router.push("/achievements");
      }
    } catch (err: any) {
      console.error("Failed to complete lesson:", err);
      toast.error("Failed to record completion. Please try again.");
    } finally {
      setCompletingLesson(false);
    }
  };

  const handleAskQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionInput.trim() || !lesson) return;
    const userMsg = questionInput;
    setChatLogs((prev) => [
      ...prev,
      { sender: "You", tag: `Section ${currentSectionIndex + 1}`, text: userMsg, isUser: true },
    ]);
    setQuestionInput("");

    setTimeout(() => {
      setChatLogs((prev) => [
        ...prev,
        {
          sender: "ALMA",
          tag: "spoken_answer",
          text: `Great question regarding "${userMsg}"! In ${lesson.topic}, remember: ${activeSection?.purpose || "focus on small verifiable steps"}. Feel free to ask more!`,
          isUser: false,
        },
      ]);
    }, 500);
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#fff8ec]">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-[#118a80] animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-[#10292e]">Loading lesson player...</p>
        </div>
      </div>
    );
  }

  if (error || !lesson) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-[#fff8ec] p-6">
        <div className="bg-white rounded-3xl p-8 border border-red-200 text-center max-w-md w-full">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
          <h2 className="text-base font-black text-[#10292e] mb-2">Lesson Player</h2>
          <p className="text-xs text-red-600 mb-6">{error || "Lesson not found."}</p>
          <Link
            href="/my-lessons"
            className="inline-block px-5 py-2.5 bg-[#ffa11f] text-[#10292e] rounded-full text-xs font-bold"
          >
            &larr; Back to My Lessons
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <Sidebar />

      <main className="flex-1 min-w-0 min-h-screen bg-[#fff8ec] px-5 sm:px-10 lg:px-12 pt-20 lg:pt-10 pb-24 md:pb-10 overflow-y-auto">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
              {lesson.topic}
            </h1>
            <p className="text-xs sm:text-sm text-[#607274] mt-1 font-medium">
              {lesson.course_title} › {lesson.module_title} · Section {currentSectionIndex + 1} of{" "}
              {lesson.sections.length}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex bg-[#e6f5f2] text-[#118a80] px-3 py-1 rounded-full text-xs font-bold">
              {lesson.programming_language} · {lesson.grade_level}
            </span>

            <Link
              href="/my-lessons"
              className="px-5 py-2 rounded-full border border-[#10292e] text-[#10292e] hover:bg-[#10292e] hover:text-white text-xs font-bold transition-colors"
            >
              Save &amp; exit
            </Link>
          </div>
        </div>

        {/* 3 Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Sections (3 cols) */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-5 border border-[#e8eeea] shadow-xs space-y-3">
            <h3 className="font-extrabold text-sm text-[#10292e] px-1">Sections</h3>

            <div className="space-y-2">
              {lesson.sections.map((sec, idx) => {
                const isSelected = idx === currentSectionIndex;
                const isDone = completedSections.includes(idx);

                return (
                  <button
                    key={idx}
                    onClick={() => {
                      setCurrentSectionIndex(idx);
                      setSelectedOption("");
                      setCheckedAnswer(null);
                      setShowRemediation(false);
                      setDiagnosedMisconception(null);
                    }}
                    className={`w-full text-left p-3.5 rounded-2xl flex items-center gap-3 transition-all cursor-pointer ${
                      isSelected
                        ? "border-2 border-[#ffa11f] bg-[#fffcf7]"
                        : "border border-[#e8eeea] hover:bg-[#fafaf8]"
                    }`}
                  >
                    {isDone ? (
                      <div className="w-5 h-5 rounded-full bg-[#118a80] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3.5 h-3.5" />
                      </div>
                    ) : isSelected ? (
                      <div className="w-5 h-5 rounded-full bg-[#ffa11f] flex items-center justify-center shrink-0">
                        <div className="w-2 h-2 rounded-full bg-white" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full border-2 border-[#d0d0cb] shrink-0" />
                    )}

                    <div className="min-w-0">
                      <div
                        className={`text-xs font-bold leading-tight truncate ${
                          isSelected ? "text-[#10292e]" : "text-[#607274]"
                        }`}
                      >
                        {sec.title}
                      </div>
                      <div className="text-[10px] text-[#8a999b]">Section {idx + 1}</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Center Column: Content & Checkpoint (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Greeting Box */}
            <div className="bg-[#e6f5f2] rounded-2xl p-4 border border-[#d2ede7]">
              <div className="text-xs font-bold text-[#118a80]">
                ALMA: Let's master {activeSection?.title || lesson.topic}! Step by step.
              </div>
              <div className="text-[10px] text-[#8a999b] font-mono mt-0.5">
                adaptive_tutor_session
              </div>
            </div>

            {/* Section Content Card */}
            <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs space-y-4">
              <h2 className="text-xl font-black text-[#10292e]">
                {activeSection?.title}
              </h2>
              {activeSection?.purpose && (
                <p className="text-xs text-[#8a999b] font-medium">
                  Objective: {activeSection.purpose}
                </p>
              )}

              {/* Modular blocks */}
              {activeSection?.blocks && activeSection.blocks.length > 0 ? (
                <div className="space-y-4">
                  {activeSection.blocks.map((b, bIdx) => {
                    if (b.type === "paragraph") {
                      return (
                        <p key={bIdx} className="text-xs sm:text-sm text-[#607274] leading-relaxed">
                          {b.text}
                        </p>
                      );
                    }
                    if (b.type === "code") {
                      return (
                        <div key={bIdx} className="bg-[#0b1a1c] text-[#a4efb3] font-mono text-xs p-4 rounded-2xl space-y-2">
                          <pre className="whitespace-pre-wrap">{b.code}</pre>
                          {b.expected_output && (
                            <div className="pt-2 border-t border-[#1b3438] text-[#8a999b] text-[11px]">
                              expected_output: {b.expected_output}
                            </div>
                          )}
                        </div>
                      );
                    }
                    if (b.type === "callout") {
                      return (
                        <div
                          key={bIdx}
                          className="p-3.5 rounded-2xl bg-[#fff3db] border border-[#fae2b8] text-xs text-[#10292e]"
                        >
                          <span className="font-bold uppercase text-[10px] text-[#ffa11f] block mb-0.5">
                            {b.callout_type || "Tip"}
                          </span>
                          {b.text}
                        </div>
                      );
                    }
                    if (b.type === "list") {
                      return (
                        <ul key={bIdx} className="space-y-1.5 list-disc pl-5 text-xs text-[#607274]">
                          {b.items?.map((item, iIdx) => (
                            <li key={iIdx}>{item}</li>
                          ))}
                        </ul>
                      );
                    }
                    return null;
                  })}
                </div>
              ) : null}

              {/* If no blocks and no diagnostic, show simple guidance */}
              {(!activeSection?.blocks || activeSection.blocks.length === 0) && !diagnostic && (
                <p className="text-xs sm:text-sm text-[#607274]">
                  Proceed to the next section or test your knowledge in the diagnostic checkpoints.
                </p>
              )}

              {/* Audio segment bar */}
              <div className="mt-4 p-3 rounded-2xl bg-[#fafaf8] border border-[#f0f0eb] flex items-center gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-8 h-8 rounded-full bg-[#ffa11f] text-[#10292e] flex items-center justify-center shrink-0 hover:bg-[#ff9400] transition-colors cursor-pointer"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4 fill-current" />
                  ) : (
                    <Play className="w-4 h-4 fill-current translate-x-0.5" />
                  )}
                </button>
                <div className="flex-1 bg-[#e8eeea] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#118a80] h-full rounded-full transition-all"
                    style={{ width: `${((currentSectionIndex + 1) / lesson.sections.length) * 100}%` }}
                  />
                </div>
                <span className="text-[11px] text-[#8a999b] font-medium shrink-0">
                  Section {currentSectionIndex + 1} of {lesson.sections.length}
                </span>
              </div>

              {/* Next Section Button */}
              {currentSectionIndex < lesson.sections.length - 1 ? (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      if (!completedSections.includes(currentSectionIndex)) {
                        setCompletedSections((prev) => [...prev, currentSectionIndex]);
                      }
                      setCurrentSectionIndex((prev) => prev + 1);
                      setSelectedOption("");
                      setCheckedAnswer(null);
                      setShowRemediation(false);
                      setDiagnosedMisconception(null);
                    }}
                    className="px-5 py-2 bg-[#10292e] hover:bg-[#1b3438] text-white font-extrabold text-xs rounded-full cursor-pointer transition-colors"
                  >
                    Next Section &rarr;
                  </button>
                </div>
              ) : (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={handleCompleteLesson}
                    disabled={completingLesson}
                    className="px-6 py-2.5 bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-xs rounded-full cursor-pointer transition-all flex items-center gap-2 shadow-xs"
                  >
                    {completingLesson ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <Trophy className="w-3.5 h-3.5" />
                        <span>Finish Lesson 🎉</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>

            {/* Checkpoint Question Card */}
            {diagnostic && (
              <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs space-y-4">
                <div className="flex items-center justify-between text-xs text-[#8a999b] font-mono">
                  <span>Checkpoint · {diagnostic.concept_tag || lesson.programming_language}</span>
                  {checkedAnswer === true && (
                    <span className="text-[#118a80] font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" /> Passed
                    </span>
                  )}
                </div>

                <h3 className="font-extrabold text-base text-[#10292e]">
                  {diagnostic.question_text}
                </h3>

                {diagnostic.code_snippet && (
                  <div className="bg-[#0b1a1c] text-[#a4efb3] font-mono text-xs p-3 rounded-xl">
                    <pre className="whitespace-pre-wrap">{diagnostic.code_snippet}</pre>
                  </div>
                )}

                <div className="space-y-2.5">
                  {diagnostic.options.map((opt) => {
                    const isChecked = selectedOption === opt;
                    return (
                      <button
                        key={opt}
                        onClick={() => {
                          setSelectedOption(opt);
                          setCheckedAnswer(null);
                          setShowRemediation(false);
                          setDiagnosedMisconception(null);
                        }}
                        className={`w-full text-left px-4 py-3 rounded-2xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                          isChecked
                            ? "border-2 border-[#ffa11f] bg-[#fffcf7] text-[#10292e]"
                            : "border border-[#e8eeea] bg-white hover:bg-[#fafaf8] text-[#607274]"
                        }`}
                      >
                        {opt}
                      </button>
                    );
                  })}
                </div>

                <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <button
                    onClick={handleCheckAnswer}
                    disabled={!selectedOption}
                    className="bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-xs px-6 py-2.5 rounded-full shadow-xs transition-colors self-start sm:self-auto cursor-pointer disabled:opacity-50"
                  >
                    Check answer
                  </button>
                  <span className="text-[11px] text-[#8a999b] font-mono">
                    Adaptive diagnostic evaluation
                  </span>
                </div>
              </div>
            )}

            {/* Targeted Remediation Hint Box (Shown on wrong answer) */}
            {showRemediation && (
              <div className="bg-[#fff0f3] border-2 border-dashed border-[#f4c8ce] rounded-3xl p-5 text-xs text-[#607274] leading-relaxed space-y-2 animate-in fade-in duration-300">
                <div className="font-bold text-[#f25c78] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Targeted Remediation
                </div>
                {diagnosedMisconception && (
                  <p className="font-medium text-[#10292e]">
                    {diagnosedMisconception}
                  </p>
                )}
                {diagnostic?.explanation && (
                  <p className="text-[#607274]">
                    {diagnostic.explanation}
                  </p>
                )}
                {activeSection?.remediation_blocks && activeSection.remediation_blocks.length > 0 && (
                  <div className="pt-2 border-t border-[#f4c8ce]/60 space-y-2">
                    {activeSection.remediation_blocks.map((rb, rIdx) => (
                      <p key={rIdx} className="text-[#10292e]">
                        {rb.text}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Column: Ask ALMA chat & mascot (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-[#e8eeea] shadow-xs flex flex-col min-h-[500px]">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-extrabold text-base text-[#10292e]">Ask ALMA</h3>
                <span className="bg-[#e6f5f2] text-[#118a80] text-[10px] font-mono px-2 py-0.5 rounded-md font-semibold">
                  ai_tutor
                </span>
              </div>

              {/* Chat messages */}
              <div className="flex-1 space-y-3 overflow-y-auto mb-4 max-h-[350px]">
                {chatLogs.map((msg, idx) => (
                  <div
                    key={idx}
                    className={`p-3.5 rounded-2xl text-xs ${
                      msg.isUser
                        ? "bg-[#0b1a1c] text-white ml-6"
                        : "bg-[#fff8ec] text-[#10292e] mr-4 border border-[#fae2b8]"
                    }`}
                  >
                    <div className="font-medium">{msg.text}</div>
                    <div
                      className={`text-[10px] mt-1 font-mono ${
                        msg.isUser ? "text-white/60" : "text-[#8a999b]"
                      }`}
                    >
                      {msg.sender} · {msg.tag}
                    </div>
                  </div>
                ))}

                {/* Mascot Graphic card */}
                <div className="bg-[#fff8ec] rounded-2xl p-4 text-center border border-[#fae2b8] my-4">
                  <div className="flex justify-center mb-2">
                    <MangoIcon size={48} animated />
                  </div>
                  <div className="font-bold text-xs text-[#10292e]">
                    A little practice, a big step.
                  </div>
                  <div className="text-[11px] text-[#607274] mt-0.5">
                    ALMA is here to guide your code.
                  </div>
                </div>
              </div>

              {/* Input row */}
              <form onSubmit={handleAskQuestion} className="flex items-center gap-2 pt-2 border-t border-[#f0f0eb]">
                <input
                  type="text"
                  placeholder="Ask ALMA about this lesson..."
                  value={questionInput}
                  onChange={(e) => setQuestionInput(e.target.value)}
                  className="flex-1 px-4 py-2.5 bg-[#fafaf8] rounded-full border border-[#e8eeea] text-xs text-[#10292e] placeholder-[#8a999b] focus:outline-hidden focus:border-[#ffa11f]"
                />
                <button
                  type="button"
                  onClick={() => toast.info("Listening... Speak your question.")}
                  className="w-9 h-9 rounded-full bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] flex items-center justify-center shrink-0 shadow-xs transition-colors cursor-pointer"
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  type="submit"
                  className="w-9 h-9 rounded-full bg-[#10292e] hover:bg-[#1b3438] text-white flex items-center justify-center shrink-0 shadow-xs transition-colors cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function LessonPlayerPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen flex items-center justify-center bg-[#fff8ec]">
          <Loader2 className="w-10 h-10 text-[#118a80] animate-spin" />
        </div>
      }
    >
      <LessonPlayerContent />
    </Suspense>
  );
}
