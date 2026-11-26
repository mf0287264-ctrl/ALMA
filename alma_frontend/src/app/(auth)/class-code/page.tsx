"use client";

import React, { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import MangoIcon from "@/components/MangoIcon";
import { useAuth } from "@/app/_Context/AuthContext";
import api from "@/services/api";
import { apiError } from "@/lib/api-error";
import { loginPath } from "@/lib/auth-routes";

function ClassCodeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { role, loading: checkingSession } = useAuth();
  const [editedCode, setEditedCode] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);
  const [error, setError] = useState("");
  const code = editedCode ?? searchParams.get("code") ?? "";
  const callbackUrl = "/class-code" + (code.trim() ? "?" + new URLSearchParams({ code: code.trim().toUpperCase() }) : "");

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (joining || checkingSession) return;
    const value = String(new FormData(event.currentTarget).get("class_code") || "").trim().toUpperCase();
    setError("");
    if (!/^[A-Z0-9-]{1,64}$/.test(value)) {
      setError("Paste the complete class code your teacher gave you, including any hyphens.");
      return;
    }
    if (!role) {
      router.push(loginPath("/class-code?" + new URLSearchParams({ code: value })));
      return;
    }
    if (role !== "student") {
      setError("Please log in with a student account to join a class.");
      return;
    }
    setJoining(true);
    try {
      const response = await api.post<{ success: boolean; data?: { _id: string; name: string } }>(
        "/teacher-groups/join", { class_code: value },
      );
      const group = response.data.data;
      if (!response.data.success || !group?._id) throw new Error("Class was not joined");
      toast.success("Joined " + group.name + "!");
      router.push("/teachers?" + new URLSearchParams({ group: group._id }));
    } catch (failure) {
      setError(apiError(failure, "Unable to join this class. Check the code with your teacher and try again."));
    } finally { setJoining(false); }
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#fff8ec] px-6 py-12 sm:px-12">
      <div className="w-full max-w-md">
        <Link href="/welcome" className="mb-8 inline-flex text-sm font-semibold text-[#118a80]">← Back to ALMA</Link>
        <div className="mb-6 flex justify-center"><MangoIcon size={110} animated /></div>
        <h1 className="text-center text-3xl font-extrabold text-[#10292e] sm:text-4xl">Join your class</h1>
        <p className="mt-3 text-center text-[#5a6e70]">Paste the full code your teacher gave you.</p>
        <form onSubmit={handleSubmit} className="mt-8 space-y-5" noValidate aria-busy={joining}>
          <div>
            <label htmlFor="class-code" className="mb-2 block text-sm font-bold text-[#10292e]">Class code</label>
            <input id="class-code" name="class_code" type="text" value={code} onChange={(event) => setEditedCode(event.target.value)} autoComplete="off" autoCapitalize="characters" spellCheck={false} maxLength={64} placeholder="ALMA-…" aria-invalid={!!error} aria-describedby={error ? "class-code-error" : "class-code-help"} className="w-full rounded-2xl border border-[#d2dcd7] bg-white px-4 py-4 font-mono text-base text-[#10292e]" />
            <p id="class-code-help" className="mt-2 text-sm text-[#5a6e70]">Keep the letters, numbers, and hyphens in the code.</p>
          </div>
          {error && <p id="class-code-error" role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <button type="submit" disabled={joining || checkingSession} className="w-full rounded-full bg-[#ffa11f] px-6 py-3.5 font-bold text-[#10292e] transition hover:brightness-95 disabled:opacity-60">
            {checkingSession ? "Checking sign-in…" : joining ? "Joining…" : role ? "Join class" : "Log in to join class"}
          </button>
        </form>
        {!role && <p className="mt-4 text-center text-sm text-[#5a6e70]">You’ll log in first, then return here with your code.</p>}
        <p className="mt-6 text-center text-sm text-[#5a6e70]">New to ALMA? <Link href={"/register?" + new URLSearchParams({ callbackUrl })} className="font-bold text-[#118a80]">Create a student account</Link></p>
      </div>
    </div>
  );
}

export default function ClassCodePage() {
  return <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[#fff8ec]">Loading class sign-in…</div>}><ClassCodeForm /></Suspense>;
}
