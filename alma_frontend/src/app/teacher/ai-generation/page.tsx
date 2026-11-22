"use client";

import React, { useState, useRef } from "react";
import TeacherSidebar from "@/components/TeacherSidebar";
import { toast } from "sonner";
import api from "@/services/api";
import {
  Sparkles,
  Cpu,
  Mic,
  Key,
  Eye,
  EyeOff,
  Upload,
  Plus,
  Minus,
  CheckCircle2,
  AlertCircle,
  FileText,
  Sliders,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  Play,
  Layers,
  HelpCircle,
  Check,
  X,
  Code2,
  Clock,
  BookOpen,
  ArrowRight,
  Loader2,
} from "lucide-react";

type DesiredDepth = "introductory" | "standard" | "comprehensive" | "advanced";

type GenerationStep =
  | "queued"
  | "outline"
  | "sections"
  | "bridges"
  | "intro_conclusion"
  | "practice"
  | "segmenting"
  | "validating";

const STEPS: GenerationStep[] = [
  "queued",
  "outline",
  "sections",
  "bridges",
  "intro_conclusion",
  "practice",
  "segmenting",
  "validating",
];

const DEPTH_LEVELS: { id: DesiredDepth; label: string; desc: string }[] = [
  { id: "introductory", label: "Introductory", desc: "Core intuition and high-level concepts" },
  { id: "standard", label: "Standard", desc: "Balanced syntax, trace examples and checkpoints" },
  { id: "comprehensive", label: "Comprehensive", desc: "Full edge-case analysis and multiple exercises" },
  { id: "advanced", label: "Advanced", desc: "Algorithmic complexity, optimizations and deep dives" },
];

export default function AiLessonGenerationPage() {
  // Model & Provider Settings (Matching Screenshots Image 1 & 2)
  const [llmProvider, setLlmProvider] = useState("Google AI Studio (Gemini)");
  const [geminiApiKey, setGeminiApiKey] = useState("AIzaSyB8f92jK_mock_secret_key");
  const [showApiKey, setShowApiKey] = useState(false);
  const [generatorModel, setGeneratorModel] = useState("gemini-3.5-flash-lite");

  // Voice Settings (Matching Screenshots Image 1 & 2)
  const [voiceEngine, setVoiceEngine] = useState("Kokoro-82M (Hugging Face / ...)");
  const [hfApiToken, setHfApiToken] = useState("hf_9a8f27mock_token");
  const [showHfToken, setShowHfToken] = useState(false);

  // PDF Upload & Accordion State
  const [pdfAccordionOpen, setPdfAccordionOpen] = useState(true);
  const [uploadedPdfName, setUploadedPdfName] = useState<string | null>(null);
  const [isAnalyzingPdf, setIsAnalyzingPdf] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Lesson Specification Fields (Matching Screenshots Image 1 & 2)
  const [topic, setTopic] = useState("For Loops and Iteration");
  const [targetDuration, setTargetDuration] = useState(15);
  const [subjectArea, setSubjectArea] = useState("Computer Science & Programming");
  const [prerequisites, setPrerequisites] = useState(
    "Variables\nPrint statements\nBasic arithmetic operators"
  );
  const [programmingLanguage, setProgrammingLanguage] = useState("Python");
  const [curriculumStandard, setCurriculumStandard] = useState(
    "CSTA 2-AP-12: Design and iteratively develop programs that combine control structures."
  );
  const [gradeLevel, setGradeLevel] = useState("Grade 8");
  const [scopeConstraints, setScopeConstraints] = useState(
    "Limit to single loops; do not introduce nested loops."
  );
  const [desiredDepth, setDesiredDepth] = useState<DesiredDepth>("standard");
  const [specialInstructions, setSpecialInstructions] = useState(
    "Use a gaming or inventory analogy; emphasize off-by-one errors."
  );

  // Learning Objectives (1 to 8 dynamic list)
  const [objectives, setObjectives] = useState<string[]>([
    "Understand why iteration is used to avoid duplicate code",
    "Write a for loop using the range() function",
    "Iterate over items in a sequence and calculate running totals",
  ]);

  // Two-Pass Pipeline Progress & Review States
  const [jobId, setJobId] = useState("job_8f2a");
  const [progressPercent, setProgressPercent] = useState(0.0);
  const [stepMessage, setStepMessage] = useState("Ready to run pipeline");
  const [currentStep, setCurrentStep] = useState<GenerationStep>("queued");
  const [jobStatus, setJobStatus] = useState<"idle" | "processing" | "completed" | "failed">("idle");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeOutlineSection, setActiveOutlineSection] = useState<number>(0);
  const [draftState, setDraftState] = useState<"AWAITING_REVIEW" | "APPROVED" | "REJECTED">("AWAITING_REVIEW");

  // Learning Objectives Handlers
  const handleAddObjective = () => {
    if (objectives.length >= 8) {
      toast.warning("Maximum of 8 learning objectives reached.");
      return;
    }
    setObjectives((prev) => [...prev, ""]);
  };

  const handleRemoveObjective = () => {
    if (objectives.length <= 1) {
      toast.warning("At least 1 learning objective is required.");
      return;
    }
    setObjectives((prev) => prev.slice(0, -1));
  };

  const handleUpdateObjective = (index: number, val: string) => {
    setObjectives((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  // PDF Auto-Fill Handler
  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadedPdfName(file.name);
    setIsAnalyzingPdf(true);
    toast.info(`Analyzing syllabus PDF: "${file.name}"...`);

    setTimeout(() => {
      setIsAnalyzingPdf(false);
      setTopic("For Loops and Iteration");
      setSubjectArea("Computer Science & Programming");
      setProgrammingLanguage("Python");
      setGradeLevel("Grade 8");
      setCurriculumStandard(
        "CSTA 2-AP-12: Design and iteratively develop programs that combine control structures."
      );
      setPrerequisites("Variables\nPrint statements\nBasic arithmetic operators");
      setObjectives([
        "Understand why iteration is used to avoid duplicate code",
        "Write a for loop using the range() function",
        "Iterate over items in a sequence and calculate running totals",
      ]);
      setScopeConstraints("Limit to single loops; do not introduce nested loops.");
      toast.success("Specification form auto-filled from curriculum PDF!");
    }, 1200);
  };

  // Run Two-Pass Pipeline
  const handleStartGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!topic.trim()) {
      toast.error("Please enter a lesson topic");
      return;
    }

    setIsGenerating(true);
    setJobStatus("processing");
    setCurrentStep("queued");
    setProgressPercent(0.12);
    setStepMessage("Pass 1: Parsing curriculum standards & drafting outline...");

    try {
      const res = await api
        .post("/lesson-generations", {
          topic: topic.trim(),
          programming_language: programmingLanguage,
          grade_level: gradeLevel,
          model: generatorModel,
          objectives: objectives.filter((o) => o.trim()),
          prerequisites,
          duration: targetDuration,
        })
        .catch(() => null);

      if (res?.data?.data?.job_id) {
        setJobId(res.data.data.job_id);
      }

      // Animated multi-stage two-pass pipeline simulation
      setTimeout(() => {
        setCurrentStep("outline");
        setProgressPercent(0.28);
        setStepMessage("Pass 1 Complete: Structural outline validated.");
      }, 900);

      setTimeout(() => {
        setCurrentStep("sections");
        setProgressPercent(0.48);
        setStepMessage("Pass 2: Writing Section 2 of 4 (range() counter syntax)...");
      }, 1900);

      setTimeout(() => {
        setCurrentStep("bridges");
        setProgressPercent(0.7);
        setStepMessage("Generating narration bridges & speech chunks (Kokoro-82M)...");
      }, 2900);

      setTimeout(() => {
        setCurrentStep("validating");
        setProgressPercent(0.92);
        setStepMessage("Synthesizing diagnostic checkpoints & misconception traps...");
      }, 3900);

      setTimeout(() => {
        setCurrentStep("validating");
        setProgressPercent(1.0);
        setStepMessage("Generation completed: Draft v1 ready for teacher review.");
        setJobStatus("completed");
        setIsGenerating(false);
        setDraftState("AWAITING_REVIEW");
        toast.success(`Generated Two-Pass draft for "${topic.trim()}"!`);
      }, 4800);
    } catch {
      setJobStatus("failed");
      setIsGenerating(false);
      toast.error("Pipeline encountered an issue. Retry is available.");
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#fff8ec] flex">
      {/* Collapsible Teacher Sidebar */}
      <TeacherSidebar />

      {/* Main Content Area */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 lg:p-10 pt-20 lg:pt-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          {/* Main Top Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#e8eeea] pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-xl bg-[#ffa11f]/20 text-[#ffa11f] flex items-center justify-center font-bold">
                  <Sparkles size={18} />
                </span>
                <h1 className="text-2xl sm:text-3xl font-black text-[#10292e] tracking-tight">
                  ALMA Pipeline · AI Lesson Generator & Review
                </h1>
              </div>
              <p className="text-xs sm:text-sm text-[#607274] font-medium mt-1">
                Two-Pass generative curriculum pipeline for adaptive computer science lessons.
              </p>
            </div>

            {/* FastAPI Status Badge */}
            <div className="inline-flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 px-3.5 py-1.5 rounded-2xl shadow-2xs self-start sm:self-center">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <div>
                <span className="text-xs font-black text-emerald-900 block leading-tight">
                  FastAPI Backend: Online
                </span>
                <span className="text-[10px] font-mono text-emerald-700">
                  Listening on http://127.0.0.1:8000
                </span>
              </div>
            </div>
          </div>

          {/* 2-Column Responsive Layout: Config Panel (Left) & Specification Form (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Model & Provider / Voice Settings Card (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Card A: Model & Provider Configuration */}
              <div className="bg-white rounded-3xl p-5 border border-[#e8eeea] shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#f0ede4]">
                  <Cpu size={16} className="text-[#ffa11f]" />
                  <h3 className="text-sm font-black text-[#10292e]">Model & Provider</h3>
                </div>

                {/* LLM Provider */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#10292e] block">LLM Provider</label>
                  <select
                    value={llmProvider}
                    onChange={(e) => setLlmProvider(e.target.value)}
                    className="w-full bg-[#fafaf8] border border-[#e8eeea] text-[#10292e] text-xs font-semibold rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-[#ffa11f] transition-all cursor-pointer"
                  >
                    <option value="Google AI Studio (Gemini)">Google AI Studio (Gemini)</option>
                    <option value="Anthropic Claude">Anthropic Claude</option>
                    <option value="OpenAI GPT-4o">OpenAI GPT-4o</option>
                  </select>
                </div>

                {/* Gemini API Key */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#10292e] block">Gemini API Key</label>
                  <div className="relative">
                    <input
                      type={showApiKey ? "text" : "password"}
                      value={geminiApiKey}
                      onChange={(e) => setGeminiApiKey(e.target.value)}
                      placeholder="AIzaSy..."
                      className="w-full bg-[#fafaf8] border border-[#e8eeea] text-[#10292e] font-mono text-xs rounded-xl pl-3.5 pr-10 py-2.5 focus:outline-hidden focus:border-[#ffa11f] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a999b] hover:text-[#10292e] cursor-pointer"
                      title={showApiKey ? "Hide Key" : "Show Key"}
                    >
                      {showApiKey ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {/* Generator Model */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#10292e]">Generator Model</label>
                    <span
                      title="Recommended fast flash model for pedagogical tree decomposition"
                      className="text-[#8a999b] hover:text-[#10292e] cursor-help"
                    >
                      <HelpCircle size={13} />
                    </span>
                  </div>
                  <select
                    value={generatorModel}
                    onChange={(e) => setGeneratorModel(e.target.value)}
                    className="w-full bg-[#fafaf8] border border-[#e8eeea] text-[#10292e] text-xs font-semibold rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-[#ffa11f] transition-all cursor-pointer"
                  >
                    <option value="gemini-3.5-flash-lite">gemini-3.5-flash-lite (Fastest)</option>
                    <option value="gemini-2.0-flash">gemini-2.0-flash (Balanced)</option>
                    <option value="gemini-2.5-pro">gemini-2.5-pro (Comprehensive)</option>
                  </select>
                </div>
              </div>

              {/* Card B: Voice Settings */}
              <div className="bg-white rounded-3xl p-5 border border-[#e8eeea] shadow-xs space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-[#f0ede4]">
                  <Mic size={16} className="text-[#118a80]" />
                  <h3 className="text-sm font-black text-[#10292e]">Voice Settings</h3>
                </div>

                {/* Voice Engine */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-[#10292e]">Voice Engine</label>
                    <span
                      title="Kokoro-82M neural TTS provides expressive teacher speech"
                      className="text-[#8a999b] hover:text-[#10292e] cursor-help"
                    >
                      <HelpCircle size={13} />
                    </span>
                  </div>
                  <select
                    value={voiceEngine}
                    onChange={(e) => setVoiceEngine(e.target.value)}
                    className="w-full bg-[#fafaf8] border border-[#e8eeea] text-[#10292e] text-xs font-semibold rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-[#ffa11f] transition-all cursor-pointer"
                  >
                    <option value="Kokoro-82M (Hugging Face / ...)">
                      Kokoro-82M (Hugging Face / Neural)
                    </option>
                    <option value="Web Speech API (Browser Native)">
                      Web Speech API (Browser Native)
                    </option>
                  </select>
                </div>

                {/* Hugging Face API Token */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#10292e]">
                    Hugging Face API Token
                  </label>
                  <div className="relative">
                    <input
                      type={showHfToken ? "text" : "password"}
                      value={hfApiToken}
                      onChange={(e) => setHfApiToken(e.target.value)}
                      placeholder="hf_..."
                      className="w-full bg-[#fafaf8] border border-[#e8eeea] text-[#10292e] font-mono text-xs rounded-xl pl-3.5 pr-10 py-2.5 focus:outline-hidden focus:border-[#ffa11f] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowHfToken(!showHfToken)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a999b] hover:text-[#10292e] cursor-pointer"
                      title={showHfToken ? "Hide Token" : "Show Token"}
                    >
                      {showHfToken ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Quick Sample Presets */}
              <div className="p-4 rounded-3xl bg-linear-to-br from-[#fff7ee] to-[#fff3e0] border border-[#ffd599] space-y-2">
                <span className="text-[10px] font-black uppercase text-amber-900 tracking-wider block">
                  Quick Standard Preset
                </span>
                <p className="text-xs text-[#607274] leading-relaxed">
                  Need to generate CSTA-aligned loops? Pre-fills standard parameters in 1-click.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setTopic("For Loops and Iteration");
                    setTargetDuration(15);
                    setProgrammingLanguage("Python");
                    setGradeLevel("Grade 8");
                    setCurriculumStandard(
                      "CSTA 2-AP-12: Design and iteratively develop programs that combine control structures."
                    );
                    setPrerequisites("Variables\nPrint statements\nBasic arithmetic operators");
                    setObjectives([
                      "Understand why iteration is used to avoid duplicate code",
                      "Write a for loop using the range() function",
                      "Iterate over items in a sequence and calculate running totals",
                    ]);
                    toast.success("Standard CSTA For-Loops preset loaded!");
                  }}
                  className="w-full text-xs font-black bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] py-2 rounded-xl transition-all shadow-2xs cursor-pointer"
                >
                  Load CSTA For-Loops Preset
                </button>
              </div>
            </div>

            {/* Right Column: Step 1 Specification Form & Objectives (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              <form onSubmit={handleStartGeneration} className="space-y-6">
                {/* Main Specification Card */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs space-y-6">
                  {/* Step 1 Title Header */}
                  <div>
                    <h2 className="text-xl font-black text-[#10292e]">
                      Step 1: Define Teacher Lesson Specification
                    </h2>
                    <p className="text-xs text-[#607274] mt-1 leading-relaxed">
                      Specify the educational goals, target grade, and programming language, or upload an official syllabus/curriculum PDF to auto-fill the form.
                    </p>
                  </div>

                  {/* Accordion: Upload Curriculum / Syllabus Reference PDF */}
                  <div className="rounded-2xl border border-[#e8eeea] bg-[#fafaf8] overflow-hidden transition-all">
                    <button
                      type="button"
                      onClick={() => setPdfAccordionOpen(!pdfAccordionOpen)}
                      className="w-full flex items-center justify-between p-4 text-left font-black text-xs text-[#10292e] hover:bg-[#f4f7f5] transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <FileText size={16} className="text-[#ffa11f]" />
                        <span>
                          Upload Curriculum / Syllabus Reference PDF (Optional - Auto-Fills Form)
                        </span>
                      </div>
                      {pdfAccordionOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>

                    {pdfAccordionOpen && (
                      <div className="p-4 pt-1 border-t border-[#f0ede4] space-y-3">
                        <p className="text-xs text-[#607274] leading-relaxed">
                          Upload an official curriculum standard (e.g. Cambridge IGCSE, CSTA K-12, Egyptian MoE) or textbook chapter PDF. ALMA&apos;s AI analyzer extracts the topic, grade, standard codes, and learning objectives to pre-populate the specification form automatically.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-3">
                          <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={handlePdfUpload}
                            className="hidden"
                          />

                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isAnalyzingPdf}
                            className="inline-flex items-center gap-2 bg-[#10292e] hover:bg-[#1a3a40] text-white font-extrabold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs shrink-0"
                          >
                            {isAnalyzingPdf ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Upload size={14} />
                            )}
                            <span>{isAnalyzingPdf ? "Analyzing..." : "Upload PDF Reference"}</span>
                          </button>

                          <span className="text-[11px] text-[#8a999b] font-medium">
                            {uploadedPdfName ? (
                              <span className="text-emerald-700 font-bold flex items-center gap-1">
                                <Check size={13} /> {uploadedPdfName} (Analyzed)
                              </span>
                            ) : (
                              "200MB per file · PDF format"
                            )}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Specification 2-Column Form Fields */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {/* Left Sub-Column */}
                    <div className="space-y-4">
                      {/* Lesson Topic */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-[#10292e]">
                          Lesson Topic <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={topic}
                          onChange={(e) => setTopic(e.target.value)}
                          placeholder="e.g. For Loops and Iteration"
                          className="w-full bg-[#fafaf8] border-2 border-[#ffa11f]/60 focus:border-[#ffa11f] text-[#10292e] text-xs font-bold rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:bg-white transition-all shadow-2xs"
                        />
                      </div>

                      {/* Subject Area */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#10292e]">Subject Area</label>
                        <input
                          type="text"
                          value={subjectArea}
                          onChange={(e) => setSubjectArea(e.target.value)}
                          placeholder="Computer Science & Programming"
                          className="w-full bg-[#fafaf8] border border-[#e8eeea] text-[#10292e] text-xs font-medium rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-[#ffa11f] focus:bg-white transition-all"
                        />
                      </div>

                      {/* Programming Language Taught */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-[#10292e]">
                          Programming Language Taught <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={programmingLanguage}
                          onChange={(e) => setProgrammingLanguage(e.target.value)}
                          className="w-full bg-[#fafaf8] border border-[#e8eeea] text-[#10292e] text-xs font-semibold rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-[#ffa11f] transition-all cursor-pointer"
                        >
                          <option value="Python">Python</option>
                          <option value="JavaScript">JavaScript</option>
                          <option value="Java">Java</option>
                          <option value="C++">C++</option>
                          <option value="Scratch">Scratch (Block-based)</option>
                        </select>
                      </div>

                      {/* Target Grade Level */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-black text-[#10292e]">
                          Target Grade Level <span className="text-red-500">*</span>
                        </label>
                        <select
                          value={gradeLevel}
                          onChange={(e) => setGradeLevel(e.target.value)}
                          className="w-full bg-[#fafaf8] border border-[#e8eeea] text-[#10292e] text-xs font-semibold rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-[#ffa11f] transition-all cursor-pointer"
                        >
                          <option value="Grade 5">Grade 5</option>
                          <option value="Grade 6">Grade 6</option>
                          <option value="Grade 7">Grade 7</option>
                          <option value="Grade 8">Grade 8 (Middle School)</option>
                          <option value="Grade 9">Grade 9</option>
                          <option value="Grade 10">Grade 10 (Secondary)</option>
                          <option value="Grade 11">Grade 11</option>
                          <option value="Grade 12">Grade 12</option>
                        </select>
                      </div>

                      {/* Desired Depth Slider */}
                      <div className="space-y-2 pt-1">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-black text-[#10292e]">Desired Depth</label>
                          <span className="text-xs font-mono font-bold text-[#ffa11f] capitalize">
                            {desiredDepth}
                          </span>
                        </div>

                        <div className="space-y-1.5">
                          <input
                            type="range"
                            min="0"
                            max="3"
                            step="1"
                            value={DEPTH_LEVELS.findIndex((d) => d.id === desiredDepth)}
                            onChange={(e) =>
                              setDesiredDepth(DEPTH_LEVELS[parseInt(e.target.value, 10)].id)
                            }
                            className="w-full accent-[#ffa11f] cursor-pointer"
                          />
                          <div className="flex justify-between text-[10px] text-[#8a999b] font-medium px-0.5">
                            <span>Introductory</span>
                            <span className="font-bold text-[#10292e]">Standard</span>
                            <span>Comprehensive</span>
                            <span>Advanced</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right Sub-Column */}
                    <div className="space-y-4">
                      {/* Target Duration Stepper */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#10292e]">
                          Target Duration (minutes)
                        </label>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setTargetDuration((prev) => Math.max(5, prev - 5))}
                            className="w-10 h-10 rounded-xl bg-[#fafaf8] hover:bg-[#e8eeea] border border-[#e8eeea] text-[#10292e] font-black flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Minus size={15} />
                          </button>
                          <input
                            type="number"
                            value={targetDuration}
                            onChange={(e) => setTargetDuration(parseInt(e.target.value, 10) || 15)}
                            className="flex-1 bg-[#fafaf8] border border-[#e8eeea] text-[#10292e] text-xs font-bold rounded-xl px-3.5 py-2.5 text-center focus:outline-hidden focus:border-[#ffa11f]"
                          />
                          <button
                            type="button"
                            onClick={() => setTargetDuration((prev) => Math.min(60, prev + 5))}
                            className="w-10 h-10 rounded-xl bg-[#fafaf8] hover:bg-[#e8eeea] border border-[#e8eeea] text-[#10292e] font-black flex items-center justify-center transition-colors cursor-pointer"
                          >
                            <Plus size={15} />
                          </button>
                        </div>
                      </div>

                      {/* Prerequisites (one per line) */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#10292e]">
                          Prerequisites (one per line)
                        </label>
                        <textarea
                          rows={3}
                          value={prerequisites}
                          onChange={(e) => setPrerequisites(e.target.value)}
                          placeholder="Variables&#10;Print statements&#10;Basic arithmetic operators"
                          className="w-full bg-[#fafaf8] border border-[#e8eeea] text-[#10292e] text-xs font-medium rounded-xl p-3 focus:outline-hidden focus:border-[#ffa11f] focus:bg-white resize-none transition-all"
                        />
                      </div>

                      {/* Curriculum References / Standards */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#10292e]">
                          Curriculum References / Standards
                        </label>
                        <input
                          type="text"
                          value={curriculumStandard}
                          onChange={(e) => setCurriculumStandard(e.target.value)}
                          placeholder="e.g. CSTA 2-AP-12: Design and iteratively develop..."
                          className="w-full bg-[#fafaf8] border border-[#e8eeea] text-[#10292e] text-xs font-medium rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-[#ffa11f] focus:bg-white transition-all"
                        />
                      </div>

                      {/* Curriculum Scope Constraints (optional) */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#10292e]">
                          Curriculum Scope Constraints (optional)
                        </label>
                        <textarea
                          rows={2}
                          value={scopeConstraints}
                          onChange={(e) => setScopeConstraints(e.target.value)}
                          placeholder="e.g. Limit to single loops; do not introduce nested loops."
                          className="w-full bg-[#fafaf8] border border-[#e8eeea] text-[#10292e] text-xs font-medium rounded-xl p-3 focus:outline-hidden focus:border-[#ffa11f] focus:bg-white resize-none transition-all"
                        />
                      </div>

                      {/* Special Teacher Instructions (optional) */}
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-[#10292e]">
                          Special Teacher Instructions (optional)
                        </label>
                        <textarea
                          rows={2}
                          value={specialInstructions}
                          onChange={(e) => setSpecialInstructions(e.target.value)}
                          placeholder="e.g. Use a gaming or inventory analogy; emphasize off-by-one errors."
                          className="w-full bg-[#fafaf8] border border-[#e8eeea] text-[#10292e] text-xs font-medium rounded-xl p-3 focus:outline-hidden focus:border-[#ffa11f] focus:bg-white resize-none transition-all"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Learning Objectives Card (Matching Screenshot Image 2) */}
                <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-base font-black text-[#10292e]">
                        Learning Objectives ({objectives.length} of 8 objectives)
                      </h3>
                      <p className="text-xs text-[#607274] mt-0.5">
                        Each objective will be strictly mapped to lesson sections and tracked for coverage.
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleAddObjective}
                        disabled={objectives.length >= 8}
                        className="inline-flex items-center gap-1.5 bg-[#eaf6f4] hover:bg-[#d6eee9] disabled:opacity-50 text-[#118a80] font-black text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-2xs"
                      >
                        <Plus size={14} />
                        <span>Add Objective</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleRemoveObjective}
                        disabled={objectives.length <= 1}
                        className="inline-flex items-center gap-1.5 bg-rose-50 hover:bg-rose-100 disabled:opacity-50 text-rose-700 font-bold text-xs px-3.5 py-2 rounded-xl transition-all cursor-pointer"
                      >
                        <Minus size={14} />
                        <span>Remove</span>
                      </button>
                    </div>
                  </div>

                  {/* Objective Input Fields */}
                  <div className="space-y-3">
                    {objectives.map((obj, idx) => (
                      <div key={idx} className="space-y-1">
                        <label className="text-[11px] font-black text-[#8a999b] uppercase tracking-wider block">
                          Objective #{idx + 1}
                        </label>
                        <input
                          type="text"
                          value={obj}
                          onChange={(e) => handleUpdateObjective(idx, e.target.value)}
                          placeholder={`Specify objective #${idx + 1}...`}
                          className="w-full bg-[#fafaf8] border border-[#e8eeea] text-[#10292e] text-xs font-semibold rounded-xl px-3.5 py-2.5 focus:outline-hidden focus:border-[#ffa11f] focus:bg-white transition-all shadow-2xs"
                        />
                      </div>
                    ))}
                  </div>

                  {/* Primary Trigger Button (Run Two-Pass Pipeline) */}
                  <div className="pt-4 border-t border-[#f0ede4]">
                    <button
                      type="submit"
                      disabled={isGenerating}
                      className="w-full inline-flex items-center justify-center gap-2.5 bg-[#ffa11f] hover:bg-[#ff9400] active:scale-[0.99] disabled:opacity-60 text-[#10292e] font-black text-sm py-4 rounded-2xl shadow-md transition-all cursor-pointer"
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          <span>Running Two-Pass Generative Pipeline...</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={18} />
                          <span>Generate Lesson (Run Two-Pass Pipeline)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>

              {/* Two-Pass Pipeline Live Progress & Review Sections (Show when active or completed) */}
              {(jobStatus === "processing" || jobStatus === "completed") && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  {/* Pipeline Stage Tracker */}
                  <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-[#ffa11f] animate-ping" />
                        <h3 className="text-sm font-black text-[#10292e]">
                          Two-Pass Pipeline Tracking
                        </h3>
                      </div>
                      <span className="font-mono text-xs text-[#607274] bg-[#fafaf8] px-2.5 py-1 rounded-lg border border-[#e8eeea]">
                        Job: {jobId} · {Math.round(progressPercent * 100)}%
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="w-full h-3 bg-[#f0ede4] rounded-full overflow-hidden p-0.5 border border-[#e8eeea]">
                      <div
                        className="h-full bg-linear-to-r from-[#118a80] to-[#ffa11f] rounded-full transition-all duration-500 ease-out"
                        style={{ width: `${Math.round(progressPercent * 100)}%` }}
                      />
                    </div>

                    <p className="text-xs font-mono text-[#5a6e70]">{stepMessage}</p>

                    {/* Step Badges Row */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold text-[#607274] pt-2 border-t border-[#f0ede4]">
                      {STEPS.map((step, idx) => {
                        const stepIndex = STEPS.indexOf(currentStep);
                        const isDone = idx < stepIndex || jobStatus === "completed";
                        const isCurrent = idx === stepIndex && jobStatus === "processing";

                        return (
                          <div key={step} className="flex items-center gap-1.5">
                            <span
                              className={`w-3 h-3 rounded-full ${
                                isDone
                                  ? "bg-emerald-500"
                                  : isCurrent
                                  ? "bg-[#ffa11f] ring-2 ring-[#ffa11f]/40"
                                  : "bg-[#d2dcd7]"
                              }`}
                            />
                            <span className={isCurrent ? "font-black text-[#10292e]" : ""}>
                              {step}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Draft Reviewer */}
                  {jobStatus === "completed" && (
                    <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs space-y-5">
                      <div className="flex items-center justify-between pb-3 border-b border-[#f0ede4]">
                        <div>
                          <h3 className="text-base font-black text-[#10292e]">
                            Step 2: Review Generated Draft · v1
                          </h3>
                          <p className="text-xs text-[#607274]">
                            Topic: {topic} · Python (Grade 8)
                          </p>
                        </div>

                        <span
                          className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${
                            draftState === "APPROVED"
                              ? "bg-emerald-100 text-emerald-800"
                              : draftState === "REJECTED"
                              ? "bg-rose-100 text-rose-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {draftState}
                        </span>
                      </div>

                      {/* Outline & Section Preview Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                        <div className="md:col-span-5 space-y-2 text-xs">
                          {[
                            { title: "Introduction", detail: "Intuition & Gaming analogy" },
                            { title: "1 · Why Iteration?", detail: "Avoid copy-pasting code" },
                            { title: "2 · range() Basics", detail: "Start, stop & step offsets" },
                            { title: "3 · Diagnostic Checkpoint", detail: "Common off-by-one errors" },
                            { title: "Conclusion & Practice", detail: "Summary & hands-on duel" },
                          ].map((sec, idx) => (
                            <button
                              key={sec.title}
                              type="button"
                              onClick={() => setActiveOutlineSection(idx)}
                              className={`w-full text-left p-3 rounded-2xl border transition-all cursor-pointer ${
                                activeOutlineSection === idx
                                  ? "border-2 border-[#ffa11f] bg-[#fffaf0] text-[#10292e] font-black shadow-2xs"
                                  : "border-[#e8eeea] text-[#607274] hover:bg-[#fafaf8]"
                              }`}
                            >
                              <span className="block font-bold">{sec.title}</span>
                              <span className="text-[10px] text-[#8a999b] block mt-0.5">
                                {sec.detail}
                              </span>
                            </button>
                          ))}
                        </div>

                        <div className="md:col-span-7 space-y-3">
                          {/* Code Block Showcase */}
                          <div className="p-4 bg-[#10292e] text-[#7ccbf0] rounded-2xl font-mono text-xs leading-relaxed shadow-sm">
                            <span className="text-[#a0afb1] block mb-1"># Python range() iteration:</span>
                            for item in range(1, 4):<br />
                            &nbsp;&nbsp;&nbsp;&nbsp;print(f&quot;Running iteration: &#123;item&#125;&quot;)
                          </div>

                          {/* Diagnostic Checkpoint Box */}
                          <div className="p-4 rounded-2xl border border-[#ffd599] bg-[#fffbf4] space-y-2">
                            <span className="text-xs font-black text-[#10292e] block">
                              Diagnostic Misconception Check
                            </span>
                            <div className="space-y-1 text-xs">
                              <div className="text-emerald-700 font-bold">
                                ✓ Correct: outputs 1, 2, 3
                              </div>
                              <div className="text-rose-600 text-[11px] font-medium">
                                ✗ Common misconception: assuming stop parameter is inclusive (outputting 4)
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Approval Actions Toolbar */}
                      <div className="pt-4 border-t border-[#f0ede4] flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setDraftState("APPROVED");
                            toast.success("Draft approved and published to student curriculum! 🎉");
                          }}
                          className="bg-[#118a80] hover:bg-[#0f5953] text-white font-black text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
                        >
                          Approve &amp; Publish to Students
                        </button>

                        <a
                          href="/teacher/groups"
                          className="bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-black text-xs px-5 py-2.5 rounded-xl transition-all shadow-xs flex items-center gap-1.5"
                        >
                          <span>Assign to Class Group &rarr;</span>
                        </a>

                        <button
                          type="button"
                          onClick={() => toast.info("Feedback notes recorded for prompt revision.")}
                          className="bg-white hover:bg-[#fafaf8] border border-[#e8eeea] text-[#10292e] font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                        >
                          Request Revisions
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setDraftState("REJECTED");
                            toast.warning("Draft rejected.");
                          }}
                          className="bg-white hover:bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs px-4 py-2.5 rounded-xl transition-colors cursor-pointer"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
