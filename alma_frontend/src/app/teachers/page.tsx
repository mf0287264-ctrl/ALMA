"use client";

import React, { useState } from "react";
import Sidebar from "@/components/Sidebar";
import { MessageSquare, Send, CheckCheck, Clock, User } from "lucide-react";
import { toast } from "sonner";

interface TeacherMessage {
  id: string;
  sender: string;
  role: string;
  avatarBg: string;
  unread: boolean;
  subject: string;
  lastMessage: string;
  timestamp: string;
}

const TEACHERS_LIST: TeacherMessage[] = [
  {
    id: "t1",
    sender: "Sara Ahmed",
    role: "Class teacher · Computer Science",
    avatarBg: "bg-[#ffa11f]",
    unread: true,
    subject: "Reading practice and range()",
    lastMessage: "Thanks Layla! I'll share a few loop practice activities for home.",
    timestamp: "Today, 10:24 AM",
  },
  {
    id: "t2",
    sender: "Mohamed Mostafa",
    role: "Math teacher",
    avatarBg: "bg-[#118a80]",
    unread: true,
    subject: "Upcoming math logic quiz",
    lastMessage: "Great job completing the Logic & Puzzles course. Keep it up!",
    timestamp: "Yesterday, 3:15 PM",
  },
  {
    id: "t3",
    sender: "Nouran Ali",
    role: "Science teacher",
    avatarBg: "bg-[#59b8eb]",
    unread: true,
    subject: "Science lab project guidelines",
    lastMessage: "Please check your project brief before Tuesday's session.",
    timestamp: "Oct 27, 11:00 AM",
  },
];

export default function StudentTeachersPage() {
  const [selectedTeacher, setSelectedTeacher] = useState<TeacherMessage>(TEACHERS_LIST[0]);
  const [replyText, setReplyText] = useState("");
  const [messages, setMessages] = useState([
    {
      sender: "Sara Ahmed",
      text: "Hi Layla! I noticed you are doing great with loops. How did the practice session go yesterday?",
      time: "Yesterday, 4:30 PM",
      isTeacher: true,
    },
    {
      sender: "You",
      text: "Hi Ms. Sara! It was fun, though I was a bit confused why range(5) stops at 4 instead of 5.",
      time: "Yesterday, 5:10 PM",
      isTeacher: false,
    },
    {
      sender: "Sara Ahmed",
      text: "Thanks Layla! Remember that in computer science, counting starts from 0, so 0, 1, 2, 3, 4 gives exactly 5 numbers. I'll share a few loop practice activities for home.",
      time: "Today, 10:24 AM",
      isTeacher: true,
    },
  ]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newMsg = {
      sender: "You",
      text: replyText,
      time: "Just now",
      isTeacher: false,
    };
    setMessages((prev) => [...prev, newMsg]);
    setReplyText("");
    toast.success("Message sent to teacher!");
  };

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      <Sidebar />

      <main className="flex-1 min-h-screen bg-[#fff8ec] px-5 sm:px-10 lg:px-12 py-8 sm:py-10 overflow-y-auto pb-24 md:pb-10">
        {/* Title */}
        <div className="mb-6">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
            Teachers
          </h1>
          <p className="text-xs sm:text-sm text-[#607274] mt-1 font-medium">
            Communicate with your teachers and ask learning questions.
          </p>
        </div>

        {/* 2 Column Messenger Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Teachers List (4 cols) */}
          <div className="lg:col-span-4 bg-white rounded-3xl p-5 border border-[#e8eeea] shadow-xs space-y-3">
            <h3 className="font-extrabold text-sm text-[#10292e] px-1 mb-2">
              Messages
            </h3>

            <div className="space-y-2">
              {TEACHERS_LIST.map((t) => {
                const isSelected = t.id === selectedTeacher.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => setSelectedTeacher(t)}
                    className={`w-full text-left p-4 rounded-2xl transition-all ${
                      isSelected
                        ? "border-2 border-[#ffa11f] bg-[#fffcf7] shadow-xs"
                        : "border border-[#e8eeea] bg-white hover:bg-[#fafaf8]"
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className={`w-10 h-10 rounded-full ${t.avatarBg} text-white font-extrabold text-sm flex items-center justify-center shrink-0`}
                      >
                        {t.sender
                          .split(" ")
                          .map((n) => n[0])
                          .join("")}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-sm text-[#10292e] truncate">
                            {t.sender}
                          </span>
                          {t.unread && (
                            <span className="w-2 h-2 rounded-full bg-[#ffa11f] shrink-0" />
                          )}
                        </div>
                        <div className="text-[11px] text-[#8a999b] truncate">
                          {t.role}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs font-bold text-[#10292e] truncate">
                      {t.subject}
                    </div>
                    <div className="text-xs text-[#607274] truncate mt-0.5">
                      {t.lastMessage}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conversation Area (8 cols) */}
          <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-7 border border-[#e8eeea] shadow-xs flex flex-col min-h-[550px]">
            {/* Conversation Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[#f0f0eb] mb-4">
              <div className="flex items-center gap-3">
                <div
                  className={`w-11 h-11 rounded-full ${selectedTeacher.avatarBg} text-white font-black text-sm flex items-center justify-center`}
                >
                  {selectedTeacher.sender
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-[#10292e]">
                    {selectedTeacher.sender}
                  </h3>
                  <p className="text-xs text-[#8a999b]">
                    {selectedTeacher.role}
                  </p>
                </div>
              </div>

              <span className="bg-[#e6f5f2] text-[#118a80] text-xs font-semibold px-3 py-1 rounded-full">
                Usually replies within 1 school day
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 space-y-3.5 overflow-y-auto mb-4 pr-1">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${
                    m.isTeacher ? "items-start" : "items-end"
                  }`}
                >
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      m.isTeacher
                        ? "bg-[#fafaf8] border border-[#f0f0eb] text-[#10292e]"
                        : "bg-[#0b1a1c] text-white"
                    }`}
                  >
                    <div className="font-semibold mb-1 text-[11px] opacity-70">
                      {m.sender}
                    </div>
                    {m.text}
                  </div>
                  <span className="text-[10px] text-[#8a999b] mt-1 px-1">
                    {m.time}
                  </span>
                </div>
              ))}
            </div>

            {/* Reply Form */}
            <form
              onSubmit={handleSendMessage}
              className="flex items-center gap-2 pt-3 border-t border-[#f0f0eb]"
            >
              <input
                type="text"
                placeholder="Write a message or ask a question about your lessons..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 px-4 py-3 bg-[#fafaf8] rounded-2xl border border-[#e8eeea] text-xs sm:text-sm text-[#10292e] placeholder-[#8a999b] focus:outline-hidden focus:border-[#ffa11f]"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#ffa11f] hover:bg-[#ff9400] text-[#10292e] font-extrabold text-xs sm:text-sm rounded-2xl shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
              >
                <span>Send</span>
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
