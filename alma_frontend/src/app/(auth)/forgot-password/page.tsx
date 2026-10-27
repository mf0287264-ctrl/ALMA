"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import MangoIcon from "@/components/MangoIcon";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
      toast.success("Reset link sent! Please check your email inbox.");
    }, 800);
  };

  return (
    <div className="w-full min-h-screen bg-[#fff8ec] flex flex-col justify-center items-center px-6 sm:px-12 py-10 sm:py-16 select-none">
      <div className="w-full max-w-[370px] sm:max-w-[400px]">
        {/* Header Section */}
        <div className="mb-6">
          <div className="mb-3">
            <MangoIcon size={46} animated className="drop-shadow-sm" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
            Forgot password?
          </h1>
          <p className="text-[#5a6e70] text-sm sm:text-base mt-2">
            Enter your email and we&apos;ll send a reset link.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-bold text-[#10292e] mb-1.5"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="layla@mail.com"
              required
              className="w-full rounded-2xl border border-[#d2dcd7] bg-white px-4 py-3.5 text-sm text-[#10292e] placeholder:text-[#5a6e70]/60 focus:outline-none focus:ring-2 focus:ring-[#118a80] focus:border-transparent transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
            />
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#ffa11f] hover:brightness-95 active:scale-[0.98] text-[#10292e] font-bold text-base py-3.5 rounded-full cursor-pointer transition-all shadow-sm flex items-center justify-center disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#ffa11f]"
            >
              {loading ? "Sending..." : "Send reset link"}
            </button>
          </div>

          {submitted && (
            <p className="text-xs text-center text-[#118a80] font-semibold pt-1">
              Check your inbox for further instructions.
            </p>
          )}

          {/* Footer Link */}
          <p className="text-center text-sm text-[#5a6e70] pt-2">
            Remembered it?{" "}
            <Link
              href="/login"
              className="font-bold text-[#0b6b63] hover:text-[#084e48] hover:underline transition-colors"
            >
              Back to log in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
