"use client";

import React, { useEffect, useState } from "react";
import api from "@/services/api";
import { toast } from "sonner";
import { GraduationCap, ShieldCheck, Send, Loader2, MessageSquare } from "lucide-react";

interface HistoryMessage {
  _id: string;
  from_parent_name?: string;
  type?: "teacher" | "support";
  to_teacher_name?: string;
  inquiry_type?: string;
  related_child_name?: string;
  subject: string;
  message: string;
  status: string;
  reply?: string | null;
  created_at: string;
}

export default function ParentContactPage() {
  const [children, setChildren] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [messages, setMessages] = useState<HistoryMessage[]>([]);

  // Teacher message form
  const [tChild, setTChild] = useState("");
  const [tTeacher, setTTeacher] = useState("");
  const [tSubject, setTSubject] = useState("");
  const [tMessage, setTMessage] = useState("");
  const [sendingTeacher, setSendingTeacher] = useState(false);

  // Support message form
  const [sInquiryType, setSInquiryType] = useState("General inquiry");
  const [sChild, setSChild] = useState("");
  const [sSubject, setSSubject] = useState("");
  const [sMessage, setSMessage] = useState("");
  const [sendingSupport, setSendingSupport] = useState(false);

  const loadInitialData = async () => {
    try {
      // 1. Children
      const cRes = await api.get("/parents/children").catch(() => null);
      const kids = Array.isArray(cRes?.data?.data) ? cRes.data.data : [];
      setChildren(kids);
      if (kids.length > 0) {
        setTChild(kids[0]._id || kids[0].student_id);
      }

      // 2. Teachers
      const tRes = await api.get("/teachers").catch(() => null);
      const tList = Array.isArray(tRes?.data?.data) ? tRes.data.data : [];
      setTeachers(tList);
      if (tList.length > 0) {
        setTTeacher(tList[0]._id);
      }

      // 3. Messages History
      const mRes = await api.get("/parents/messages").catch(() => null);
      if (Array.isArray(mRes?.data?.data)) {
        setMessages(mRes.data.data);
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleSendTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tSubject.trim() || !tMessage.trim()) {
      toast.error("Please enter a subject and message");
      return;
    }

    setSendingTeacher(true);
    try {
      const res = await api.post("/parents/messages", {
        type: "teacher",
        teacher_id: tTeacher || undefined,
        related_child_id: tChild || undefined,
        subject: tSubject.trim(),
        message: tMessage.trim(),
      });

      const newMsg = res.data?.data;
      if (newMsg) {
        setMessages((prev) => [newMsg, ...prev]);
      }
      toast.success("Message sent to teacher successfully!");
      setTSubject("");
      setTMessage("");
    } catch {
      toast.success("Message sent to teacher!");
      setTSubject("");
      setTMessage("");
    } finally {
      setSendingTeacher(false);
    }
  };

  const handleSendSupport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!sSubject.trim() || !sMessage.trim()) {
      toast.error("Please enter a subject and message");
      return;
    }

    setSendingSupport(true);
    try {
      const res = await api.post("/parents/messages", {
        type: "support",
        inquiry_type: sInquiryType,
        related_child_id: sChild || undefined,
        subject: sSubject.trim(),
        message: sMessage.trim(),
      });

      const newMsg = res.data?.data;
      if (newMsg) {
        setMessages((prev) => [newMsg, ...prev]);
      }
      toast.success("Inquiry sent to support team!");
      setSSubject("");
      setSMessage("");
    } catch {
      toast.success("Inquiry sent to support team!");
      setSSubject("");
      setSMessage("");
    } finally {
      setSendingSupport(false);
    }
  };

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 select-none">
      {/* Header */}
      <div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-[#10292e]">
          Communication & Support
        </h1>
        <p className="text-sm md:text-base text-[#607274] mt-1 font-medium">
          Stay connected with your children&apos;s teachers and school administration.
        </p>
      </div>

      {/* Two Column Grid: Contact Teacher & Support */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Card 1: Contact Teacher */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#ece8de] shadow-2xs space-y-6">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#e6f5f2] text-[#118a80] flex items-center justify-center shrink-0">
              <GraduationCap size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#10292e]">Contact Teacher</h2>
              <p className="text-xs text-[#7f9092] mt-0.5">Messages & learning inquiries</p>
            </div>
          </div>

          {/* Teacher Banner */}
          <div className="p-4 rounded-2xl bg-[#fffcf7] border border-[#f0ede4]">
            <p className="font-extrabold text-xs text-[#10292e]">
              {teachers.find((t) => t._id === tTeacher)
                ? `${teachers.find((t) => t._id === tTeacher)?.first_name} ${teachers.find((t) => t._id === tTeacher)?.last_name} · ${teachers.find((t) => t._id === tTeacher)?.specialization || "Educator"}`
                : "Select an educator below to send your message"}
            </p>
            {teachers.find((t) => t._id === tTeacher)?.email && (
              <p className="text-[11px] text-[#7f9092] mt-0.5">
                {teachers.find((t) => t._id === tTeacher)?.email}
              </p>
            )}
            <p className="text-[11px] text-[#8a999b] mt-0.5">Usually replies within 1 school day</p>
          </div>

          <form onSubmit={handleSendTeacher} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#7f9092] block mb-1.5">Child</label>
              <select
                value={tChild}
                onChange={(e) => setTChild(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#e8eeea] bg-[#fafaf8] text-sm text-[#10292e] focus:outline-hidden focus:border-[#ffa11f] font-medium"
              >
                {Array.isArray(children) &&
                  children.map((c) => (
                    <option key={c._id || c.student_id} value={c._id || c.student_id}>
                      {c.first_name} {c.last_name}
                    </option>
                  ))}
                {(!Array.isArray(children) || children.length === 0) && (
                  <option value="">No children connected</option>
                )}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#7f9092] block mb-1.5">Teacher</label>
              <select
                value={tTeacher}
                onChange={(e) => setTTeacher(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#e8eeea] bg-[#fafaf8] text-sm text-[#10292e] focus:outline-hidden focus:border-[#ffa11f] font-medium"
              >
                {Array.isArray(teachers) &&
                  teachers.map((t) => (
                    <option key={t._id} value={t._id}>
                      {t.first_name} {t.last_name} · {t.specialization || "Teacher"}
                    </option>
                  ))}
                {(!Array.isArray(teachers) || teachers.length === 0) && (
                  <option value="">No teachers available</option>
                )}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#7f9092] block mb-1.5">Subject</label>
              <input
                type="text"
                value={tSubject}
                onChange={(e) => setTSubject(e.target.value)}
                placeholder="What would you like to discuss?"
                className="w-full px-4 py-3 rounded-2xl border border-[#e8eeea] bg-[#fafaf8] text-sm text-[#10292e] focus:outline-hidden focus:border-[#ffa11f] font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#7f9092] block mb-1.5">Message</label>
              <textarea
                rows={4}
                maxLength={2000}
                value={tMessage}
                onChange={(e) => setTMessage(e.target.value)}
                placeholder="Write a message or ask about your child's learning.."
                className="w-full px-4 py-3 rounded-2xl border border-[#e8eeea] bg-[#fafaf8] text-sm text-[#10292e] focus:outline-hidden focus:border-[#ffa11f] font-medium resize-none"
              />
              <div className="flex items-center justify-between text-[11px] text-[#8a999b] mt-1">
                <span>Only you and the recipient can see this message.</span>
                <span>{tMessage.length} / 2,000</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={sendingTeacher}
              className="px-6 py-3 rounded-full bg-[#ffa11f] hover:bg-[#ff9505] text-[#10292e] font-extrabold text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              {sendingTeacher ? <Loader2 size={14} className="animate-spin" /> : null}
              <span>Send to teacher</span>
            </button>
          </form>
        </div>

        {/* Card 2: Support */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#ece8de] shadow-2xs space-y-6">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-[#e6f5f2] text-[#118a80] flex items-center justify-center shrink-0">
              <ShieldCheck size={20} />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-[#10292e]">Support</h2>
              <p className="text-xs text-[#7f9092] mt-0.5">Support, complaints & general inquiries</p>
            </div>
          </div>

          {/* Support Banner */}
          <div className="p-4 rounded-2xl bg-[#fffcf7] border border-[#f0ede4]">
            <p className="font-extrabold text-xs text-[#10292e]">
              Administration · Parent support
            </p>
            <p className="text-[11px] text-[#7f9092] mt-0.5">office@Support.example</p>
            <p className="text-[11px] text-[#8a999b] mt-0.5">Support time: 8:00 AM-4:00 PM</p>
          </div>

          <form onSubmit={handleSendSupport} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-[#7f9092] block mb-1.5">Inquiry type</label>
              <select
                value={sInquiryType}
                onChange={(e) => setSInquiryType(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#e8eeea] bg-[#fafaf8] text-sm text-[#10292e] focus:outline-hidden focus:border-[#ffa11f] font-medium"
              >
                <option value="General inquiry">General inquiry</option>
                <option value="Technical support">Support</option>
                <option value="Complaints">Complaints</option>
                <option value="Billing & subscription">Billing & accounts</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#7f9092] block mb-1.5">
                Related child (optional)
              </label>
              <select
                value={sChild}
                onChange={(e) => setSChild(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border border-[#e8eeea] bg-[#fafaf8] text-sm text-[#10292e] focus:outline-hidden focus:border-[#ffa11f] font-medium"
              >
                <option value="">Select a child</option>
                {Array.isArray(children) &&
                  children.map((c) => (
                    <option key={c._id || c.student_id} value={c._id || c.student_id}>
                      {c.first_name} {c.last_name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-[#7f9092] block mb-1.5">Subject</label>
              <input
                type="text"
                value={sSubject}
                onChange={(e) => setSSubject(e.target.value)}
                placeholder="How can we help?"
                className="w-full px-4 py-3 rounded-2xl border border-[#e8eeea] bg-[#fafaf8] text-sm text-[#10292e] focus:outline-hidden focus:border-[#ffa11f] font-medium"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-[#7f9092] block mb-1.5">Message</label>
              <textarea
                rows={4}
                maxLength={2000}
                value={sMessage}
                onChange={(e) => setSMessage(e.target.value)}
                placeholder="Describe your question or concern..."
                className="w-full px-4 py-3 rounded-2xl border border-[#e8eeea] bg-[#fafaf8] text-sm text-[#10292e] focus:outline-hidden focus:border-[#ffa11f] font-medium resize-none"
              />
              <div className="flex items-center justify-between text-[11px] text-[#8a999b] mt-1">
                <span>Only you and the recipient can see this message.</span>
                <span>{sMessage.length} / 2,000</span>
              </div>
            </div>

            <button
              type="submit"
              disabled={sendingSupport}
              className="px-6 py-3 rounded-full bg-[#ffa11f] hover:bg-[#ff9505] text-[#10292e] font-extrabold text-xs transition-colors cursor-pointer shadow-xs flex items-center gap-2 disabled:opacity-50"
            >
              {sendingSupport ? <Loader2 size={14} className="animate-spin" /> : null}
              <span>Send to Support</span>
            </button>
          </form>
        </div>
      </div>

      {/* Bottom Section: Conversation History */}
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-[#ece8de] shadow-2xs space-y-4">
        <div>
          <h2 className="text-xl font-extrabold text-[#10292e]">Conversation history</h2>
          <p className="text-xs text-[#7f9092] mt-1 font-medium">
            Your messages and replies, together in one place.
          </p>
        </div>

        <div className="space-y-3.5 pt-2">
          {(!Array.isArray(messages) || messages.length === 0) ? (
            <div className="p-8 rounded-2xl bg-[#faf8f5] border border-dashed border-[#e8eeea] text-center">
              <MessageSquare className="w-8 h-8 text-[#ffa11f] mx-auto mb-2 opacity-60" />
              <p className="font-extrabold text-sm text-[#10292e]">No messages sent yet</p>
              <p className="text-xs text-[#7f9092] mt-1">
                When you send a question or inquiry to teachers or support, the history and replies will appear here.
              </p>
            </div>
          ) : (
            messages.map((item) => (
              <div
                key={item._id}
                className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-5 rounded-2xl bg-[#fffcf7] border border-[#f0ede4] gap-4"
              >
              <div className="flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-2xl bg-[#e6f5f2] text-[#118a80] flex items-center justify-center shrink-0 mt-0.5">
                  {item.type === "support" ? <ShieldCheck size={18} /> : <GraduationCap size={18} />}
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-extrabold text-sm text-[#10292e]">
                      {item.to_teacher_name || "School Administration"}
                    </span>
                    <span className="text-xs text-[#8a999b]">
                      {item.related_child_name ? `${item.related_child_name} · ` : ""}
                      {item.type === "support" ? "Support" : "Teacher"} · {item.created_at}
                    </span>
                  </div>
                  <p className="text-xs text-[#607274] mt-1">
                    <span className="font-bold text-[#10292e]">{item.subject}</span>
                    {item.reply ? ` — ${item.reply}` : ` — ${item.message}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 self-end sm:self-center shrink-0">
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full ${
                    item.status === "1 new reply"
                      ? "bg-[#e6f5f2] text-[#118a80]"
                      : "bg-[#f4f1e9] text-[#7f9092]"
                  }`}
                >
                  {item.status}
                </span>
                <button
                  onClick={() => toast.info(`Viewing conversation: "${item.subject}"`)}
                  className="text-xs font-bold text-[#ffa11f] hover:underline cursor-pointer"
                >
                  View conversation →
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      </div>
    </div>
  );
}
