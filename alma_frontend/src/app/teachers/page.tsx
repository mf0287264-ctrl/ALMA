"use client";

import React, { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/Sidebar";
import { Search, Send, FileText, Bell, BookOpen } from "lucide-react";
import { toast } from "sonner";

interface TeacherContact {
  id: string;
  name: string;
  subject: string;
  role: string;
  status: "Online" | "Offline";
  lastMessage: string;
  unreadCount?: number;
  email: string;
  officeHours: string;
  usualReplyTime: string;
  currentLesson: string;
  currentModule: string;
}

const TEACHERS: TeacherContact[] = [
  {
    id: "salma-nabil",
    name: "Salma Nabil",
    subject: "Python",
    role: "Python teacher",
    status: "Online",
    lastMessage: "Try listing the five values...",
    email: "salma.nabil@alma.school",
    officeHours: "Sun-Thu · 3-5 PM",
    usualReplyTime: "Within one school day",
    currentLesson: "Python for loops",
    currentModule: "Intro to Python · Module 2",
  },
  {
    id: "ahmed-samir",
    name: "Ahmed Samir",
    subject: "Data Basics",
    role: "Data science teacher",
    status: "Offline",
    lastMessage: "Your solution looks good!",
    unreadCount: 2,
    email: "ahmed.samir@alma.school",
    officeHours: "Mon-Wed · 2-4 PM",
    usualReplyTime: "Within 2 school days",
    currentLesson: "Lists and indexing",
    currentModule: "Data Basics · Module 1",
  },
  {
    id: "mariam-adel",
    name: "Mariam Adel",
    subject: "Algorithms",
    role: "Algorithms teacher",
    status: "Offline",
    lastMessage: "Let's review your approach.",
    unreadCount: 1,
    email: "mariam.adel@alma.school",
    officeHours: "Sun, Tue · 1-3 PM",
    usualReplyTime: "Within one school day",
    currentLesson: "Binary search basics",
    currentModule: "Algorithms Lab · Module 2",
  },
  {
    id: "dalia-hany",
    name: "Dalia Hany",
    subject: "Logic & Puzzles",
    role: "General thinking teacher",
    status: "Offline",
    lastMessage: "Well done on finishing!",
    email: "dalia.hany@alma.school",
    officeHours: "Thu · 10 AM-12 PM",
    usualReplyTime: "Within one school day",
    currentLesson: "Course completed",
    currentModule: "Logic & Puzzles",
  },
];

export default function TeacherCommunicationPage() {
  const [selectedTeacherId, setSelectedTeacherId] = useState("salma-nabil");
  const [search, setSearch] = useState("");
  const [inputMessage, setInputMessage] = useState("Why does range(1, 5) leave out 5 too?");
  const [chatHistory, setChatHistory] = useState([
    {
      id: 1,
      sender: "Salma",
      time: "10:12 AM",
      text: "Hi Layla! How are you getting on with loops?",
      isMe: false,
    },
    {
      id: 2,
      sender: "You",
      time: "10:14 AM",
      status: "Read",
      text: "I understand for loops, but range() is confusing.",
      isMe: true,
    },
    {
      id: 3,
      sender: "Salma",
      time: "10:16 AM",
      text: "range(5) starts at 0 and stops before 5. Try listing the five values: 0, 1, 2, 3, 4.",
      isMe: false,
    },
  ]);

  const teacher = TEACHERS.find((t) => t.id === selectedTeacherId) || TEACHERS[0];

  const filteredTeachers = TEACHERS.filter(
    (t) =>
      t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.subject.toLowerCase().includes(search.toLowerCase())
  );

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

    setChatHistory((prev) => [
      ...prev,
      {
        id: Date.now(),
        sender: "You",
        time: timeStr,
        status: "Sent",
        text: userText,
        isMe: true,
      },
    ]);
    setInputMessage("");

    setTimeout(() => {
      setChatHistory((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          sender: teacher.name.split(" ")[0],
          time: timeStr,
          text: `Good observation! In range(start, stop), the stop integer itself is never reached—it produces numbers strictly less than stop: [1, 2, 3, 4].`,
          isMe: false,
        },
      ]);
    }, 800);
  };

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <Sidebar />

      <main className="flex-1 min-w-0 min-h-screen bg-[#fff8ec] px-5 sm:px-10 lg:px-12 pt-20 lg:pt-10 pb-24 md:pb-10 overflow-y-auto">
        {/* Header */}
        <div className="mb-6">
          <span className="text-[#118a80] text-[11px] font-black uppercase tracking-wider block mb-1">
            STUDENT WORKSPACE
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
            Teacher communication
          </h1>
          <p className="text-xs sm:text-sm text-[#607274] mt-1 font-medium">
            Stay connected with your teachers and get support when you need it.
          </p>
        </div>

        {/* Unread notification banner */}
        <div className="bg-[#dff0fa] text-[#10292e] rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border border-[#cbe4f4]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/70 flex items-center justify-center text-[#2b88d8] shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <div className="font-extrabold text-xs sm:text-sm">
                You have 3 unread messages
              </div>
              <div className="text-[11px] text-[#607274]">
                New replies from Ahmed Samir and Mariam Adel
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            <span className="text-[11px] font-bold text-[#2b88d8] hover:underline cursor-pointer">
              Notifications on
            </span>
          </div>
        </div>

        {/* 3 Columns Layout: Teachers List | Active Chat | Teacher Details */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Column 1: My teachers (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-5 sm:p-6 border border-[#e8eeea] shadow-xs flex flex-col justify-between min-h-[580px]">
            <div>
              <div className="flex items-center justify-between mb-1">
                <h2 className="font-extrabold text-base text-[#10292e]">
                  My teachers
                </h2>
              </div>
              <p className="text-xs text-[#8a999b] mb-4">4 teachers · 3 unread</p>

              {/* Search */}
              <div className="relative mb-4">
                <Search className="w-4 h-4 text-[#8a999b] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search teachers..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#fafaf8] rounded-full border border-[#e8eeea] text-xs text-[#10292e] placeholder-[#8a999b] focus:outline-hidden focus:border-[#ffa11f]"
                />
              </div>

              {/* Teachers list */}
              <div className="space-y-2.5">
                {filteredTeachers.map((t) => {
                  const isSelected = t.id === selectedTeacherId;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTeacherId(t.id)}
                      className={`w-full text-left p-3.5 rounded-2xl transition-all ${
                        isSelected
                          ? "border-2 border-[#ffa11f] bg-[#fffcf7] shadow-xs"
                          : "border border-[#e8eeea] bg-white hover:bg-[#fafaf8]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-sm text-[#10292e]">
                          {t.name}
                        </span>
                        {t.unreadCount ? (
                          <span className="w-5 h-5 rounded-full bg-[#ffa11f] text-white text-[10px] font-black flex items-center justify-center">
                            {t.unreadCount}
                          </span>
                        ) : null}
                      </div>

                      <div className="text-xs font-semibold text-[#118a80] mt-0.5">
                        {t.subject} · {t.status}
                      </div>

                      <div className="text-xs text-[#8a999b] truncate mt-1">
                        {t.lastMessage}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-6 border-t border-[#f0f0eb] text-xs text-[#8a999b] space-y-1 mt-6">
              <p className="font-medium">School conversations stay here.</p>
              <p className="text-[#10292e] font-bold">Ask, learn, and keep growing.</p>
            </div>
          </div>

          {/* Column 2: Chat Area (5 cols) */}
          <div className="lg:col-span-5 bg-white rounded-3xl p-5 sm:p-6 border border-[#e8eeea] shadow-xs flex flex-col justify-between min-h-[580px]">
            <div>
              {/* Header */}
              <div className="pb-3 border-b border-[#f0f0eb] mb-4">
                <h2 className="font-black text-lg text-[#10292e]">
                  {teacher.name}
                </h2>
                <div className="text-xs text-[#118a80] font-semibold">
                  {teacher.status} · {teacher.role}
                </div>
              </div>

              {/* Day divider */}
              <div className="text-center my-3">
                <span className="text-[10px] font-bold tracking-wider text-[#8a999b] uppercase">
                  TODAY
                </span>
              </div>

              {/* Question Context Card */}
              <div className="p-3.5 rounded-2xl bg-[#fff8ec] border border-[#fae2b8] flex items-center gap-3 mb-4">
                <div className="w-7 h-7 rounded-full bg-white flex items-center justify-center text-[#ffa11f] shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold text-xs text-[#10292e]">
                    Question about {teacher.currentLesson}
                  </div>
                  <div className="text-[11px] text-[#8a999b]">
                    {teacher.currentModule}
                  </div>
                </div>
              </div>

              {/* Chat bubbles */}
              <div className="space-y-3">
                {chatHistory.map((m) => (
                  <div
                    key={m.id}
                    className={`flex flex-col ${
                      m.isMe ? "items-end" : "items-start"
                    }`}
                  >
                    <div
                      className={`max-w-[85%] p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                        m.isMe
                          ? "bg-[#fff3db] border border-[#fae2b8] text-[#10292e]"
                          : "bg-[#f1f3f2] text-[#10292e]"
                      }`}
                    >
                      {m.text}
                    </div>
                    <div className="text-[10px] text-[#8a999b] mt-1 px-1">
                      {m.sender} · {m.time} {m.status ? `· ${m.status}` : ""}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Input area */}
            <form onSubmit={handleSend} className="pt-4 flex items-center gap-2 mt-4">
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder="Write a message to your teacher..."
                className="flex-1 px-4 py-2.5 bg-white rounded-full border border-[#e8eeea] text-xs text-[#10292e] focus:outline-hidden focus:border-[#ffa11f]"
              />
              <button
                type="submit"
                className="px-6 py-2.5 rounded-full bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-xs shadow-xs transition-colors shrink-0"
              >
                Send
              </button>
            </form>
          </div>

          {/* Column 3: Teacher details (3 cols) */}
          <div className="lg:col-span-3 bg-white rounded-3xl p-5 sm:p-6 border border-[#e8eeea] shadow-xs flex flex-col justify-between min-h-[580px]">
            <div className="space-y-5">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#10292e]" />
                <h3 className="font-extrabold text-base text-[#10292e]">
                  Teacher details
                </h3>
              </div>

              <div>
                <div className="font-black text-lg text-[#10292e]">
                  {teacher.name}
                </div>
                <div className="text-xs text-[#118a80] font-semibold">
                  {teacher.role}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-black tracking-wider text-[#8a999b] uppercase">
                  EMAIL
                </div>
                <div className="text-xs font-bold text-[#10292e] mt-0.5">
                  {teacher.email}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-black tracking-wider text-[#8a999b] uppercase">
                  OFFICE HOURS
                </div>
                <div className="text-xs font-bold text-[#10292e] mt-0.5">
                  {teacher.officeHours}
                </div>
              </div>

              <div>
                <div className="text-[10px] font-black tracking-wider text-[#8a999b] uppercase">
                  USUAL REPLY TIME
                </div>
                <div className="text-xs font-bold text-[#10292e] mt-0.5">
                  {teacher.usualReplyTime}
                </div>
              </div>

              <div className="pt-3 border-t border-[#f0f0eb]">
                <div className="font-black text-sm text-[#10292e]">
                  Current lesson
                </div>
                <div className="text-xs font-bold text-[#10292e] mt-1">
                  {teacher.currentLesson}
                </div>
                <div className="text-[11px] text-[#8a999b]">
                  {teacher.currentModule}
                </div>

                <div className="mt-4">
                  <Link
                    href="/my-lessons/player"
                    className="block text-center w-full py-2.5 rounded-full border border-[#10292e] text-[#10292e] hover:bg-[#10292e] hover:text-white text-xs font-bold transition-colors"
                  >
                    Open lesson
                  </Link>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-[#8a999b] leading-relaxed pt-4 border-t border-[#f0f0eb] mt-6">
              Share the step you&apos;re stuck on so your teacher can help.
            </p>
          </div>
        </div>

        <p className="text-[11px] text-[#8a999b] mt-6">
          Example conversations and teacher contacts · Select Send to preview the sent-message state
        </p>
      </main>
    </div>
  );
}
