"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import MangoIcon from "@/components/MangoIcon";
import { useAuth } from "@/app/_Context/AuthContext";

export default function RegisterParentPage() {
  const { registerParent } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [errors, setErrors] = useState<{
    name?: string[];
    email?: string[];
    password?: string[];
    rePassword?: string[];
    agreeToTerms?: string[];
  }>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    const form = new FormData(e.currentTarget);
    const name = String(form.get("name") || "");
    const email = String(form.get("email") || "");
    const password = String(form.get("password") || "");
    const rePassword = String(form.get("rePassword") || "");
    const phone = String(form.get("phone_number") || "");
    const selectedRelation = form.get("relation");
    const relation = selectedRelation === "father" || selectedRelation === "mother" ? selectedRelation : "guardian";
    const childEmail = String(form.get("child_email") || "");
    const childStudentCode = String(form.get("child_student_code") || "");
    const agreeToTerms = form.has("agreeToTerms");
    setErrors({});
    setSubmitError("");

    const newErrors: typeof errors = {};
    if (!name.trim()) {
      newErrors.name = ["Full name is required"];
    }
    if (!email.includes("@") || !email.includes(".")) {
      newErrors.email = ["Enter a valid email address."];
    }
    if (password.length < 12 || password.length > 128) {
      newErrors.password = ["Password must be 12–128 characters."];
    }
    if (password !== rePassword) {
      newErrors.rePassword = ["Passwords do not match."];
    }
    if (!agreeToTerms) {
      newErrors.agreeToTerms = ["Please agree to the Terms and Privacy Policy."];
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const parts = name.trim().split(" ");
      const first_name = parts[0] || "Parent";
      const last_name = parts.slice(1).join(" ") || "User";

      const result = await registerParent({
        first_name,
        last_name,
        email,
        password,
        phone_number: phone || null,
        relation,
        child_email: childEmail.trim() || null,
        child_student_code: childStudentCode.trim() || null,
      });

      if (result.success) {
        toast.success("Parent account created successfully!");
        window.location.assign(new URL("/parent/dashboard", window.location.origin).href);
      } else {
        setSubmitError(result.error || "Registration failed. Please check your details.");
      }
    } catch {
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      {/* Left Column (Desktop Only: lg and up) */}
      <div className="hidden lg:flex lg:w-1/2 min-h-screen bg-[#4ba3d0] flex-col items-center justify-center p-12 text-center select-none relative">
        <Link
          href="/choose-role?mode=register"
          className="absolute top-8 left-8 text-white/90 hover:text-white text-sm font-semibold flex items-center gap-1.5 transition-colors"
        >
          <span>←</span> Back to Role Selection
        </Link>
        <div className="transform hover:scale-105 transition-transform duration-300">
          <MangoIcon size={190} animated className="drop-shadow-lg" />
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight mt-7">
          Parent & Guardian Portal
        </h1>
        <p className="text-white/95 text-base mt-2 font-medium max-w-sm">
          Stay connected with your child&apos;s learning path and cheer on their milestones.
        </p>
      </div>

      {/* Right Column */}
      <div className="w-full lg:w-1/2 min-h-screen bg-[#fff8ec] flex flex-col justify-center items-center px-6 sm:px-12 md:px-16 py-10 sm:py-14">
        <div className="w-full max-w-[420px]">
          <div className="mb-5">
            <div className="flex items-center justify-between mb-2">
              <MangoIcon size={46} animated className="drop-shadow-sm" />
              <Link
                href="/choose-role?mode=register"
                className="text-xs font-bold text-[#5a6e70] hover:text-[#10292e]"
              >
                Change role ↔
              </Link>
            </div>
            <h2 className="text-3xl font-extrabold text-[#10292e] tracking-tight">
              Create Parent Account
            </h2>
            <p className="text-[#5a6e70] text-sm font-semibold mt-1">
              Follow your child&apos;s coding journey &amp; progress
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5" noValidate aria-busy={loading}>
            {submitError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{submitError}</p>}
            {/* Full Name */}
            <div>
              <label htmlFor="name" className="block text-xs font-bold text-[#10292e] mb-1">
                Full Name
              </label>
              <input id="name" name="name" autoComplete="name" maxLength={100} aria-label="Full name"
                type="text"
                placeholder="Sarah Connor"
                required
                className="w-full rounded-2xl border border-[#d2dcd7] bg-white px-4 py-3 text-sm text-[#10292e] placeholder:text-[#5a6e70]/60 focus:outline-none focus:ring-2 focus:ring-[#4ba3d0]"
              />
              {errors.name?.[0] && (
                <p className="text-xs text-red-500 font-semibold mt-1">{errors.name[0]}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-xs font-bold text-[#10292e] mb-1">
                Parent Email
              </label>
              <input id="email" name="email" autoComplete="email" maxLength={254} autoCapitalize="none" spellCheck={false} aria-label="Email"
                type="email"
                placeholder="parent@example.com"
                required
                className="w-full rounded-2xl border border-[#d2dcd7] bg-white px-4 py-3 text-sm text-[#10292e] placeholder:text-[#5a6e70]/60 focus:outline-none focus:ring-2 focus:ring-[#4ba3d0]"
              />
              {errors.email?.[0] && (
                <p className="text-xs text-red-500 font-semibold mt-1">{errors.email[0]}</p>
              )}
            </div>

            {/* Phone & Relation Row */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label htmlFor="phone-number" className="block text-xs font-bold text-[#10292e] mb-1">
                  Phone (Optional)
                </label>
                <input id="phone-number" name="phone_number" autoComplete="tel" maxLength={64} aria-label="Phone number"
                  type="tel"
                  placeholder="+1 234 567 890"
                  className="w-full rounded-2xl border border-[#d2dcd7] bg-white px-3 py-3 text-xs text-[#10292e] placeholder:text-[#5a6e70]/60 focus:outline-none focus:ring-2 focus:ring-[#4ba3d0]"
                />
              </div>
              <div>
                <label htmlFor="relation" className="block text-xs font-bold text-[#10292e] mb-1">
                  Relation
                </label>
                <select id="relation" name="relation" autoComplete="off" aria-label="Relation"
                  defaultValue="guardian"
                  className="w-full rounded-2xl border border-[#d2dcd7] bg-white px-3 py-3 text-xs text-[#10292e] focus:outline-none focus:ring-2 focus:ring-[#4ba3d0]"
                >
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="guardian">Guardian</option>
                </select>
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-xs font-bold text-[#10292e] mb-1">
                Password
              </label>
              <div className="relative flex items-center">
                <input id="password" name="password" autoComplete="new-password" maxLength={128} aria-label="Password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-2xl border border-[#d2dcd7] bg-white pl-4 pr-16 py-3 text-sm text-[#10292e] placeholder:text-[#5a6e70]/60 focus:outline-none focus:ring-2 focus:ring-[#4ba3d0]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-xs font-bold text-[#4ba3d0] hover:text-[#2d7ba4]"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password?.[0] && (
                <p className="text-xs text-red-500 font-semibold mt-1">{errors.password[0]}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="rePassword" className="block text-xs font-bold text-[#10292e] mb-1">
                Confirm Password
              </label>
              <input id="rePassword" name="rePassword" autoComplete="new-password" maxLength={128} aria-label="Confirm password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                required
                className="w-full rounded-2xl border border-[#d2dcd7] bg-white px-4 py-3 text-sm text-[#10292e] placeholder:text-[#5a6e70]/60 focus:outline-none focus:ring-2 focus:ring-[#4ba3d0]"
              />
              {errors.rePassword?.[0] && (
                <p className="text-xs text-red-500 font-semibold mt-1">{errors.rePassword[0]}</p>
              )}
            </div>

            {/* Link Child (Optional at registration) */}
            <div className="p-3 bg-[#eef7fb] rounded-2xl border border-[#cbe4f2]">
              <p className="text-xs font-bold text-[#10292e] mb-1">
                Link Your Child (Optional)
              </p>
              <p className="text-[11px] text-[#5a6e70] mb-2">
                Provide either your child&apos;s registered email or student code:
              </p>
              <div className="grid grid-cols-2 gap-2">
                <input id="child-email" name="child_email" autoComplete="off" maxLength={254} aria-label="Child email"
                  type="email"
                  placeholder="Child's Email"
                  className="w-full rounded-xl border border-[#d2dcd7] bg-white px-3 py-2 text-xs text-[#10292e] placeholder:text-[#5a6e70]/60 focus:outline-none focus:ring-2 focus:ring-[#4ba3d0]"
                />
                <input id="child-code" name="child_student_code" autoComplete="off" maxLength={64} aria-label="Child student code"
                  type="text"
                  placeholder="Code (e.g. STU-1001)"
                  className="w-full rounded-xl border border-[#d2dcd7] bg-white px-3 py-2 text-xs text-[#10292e] placeholder:text-[#5a6e70]/60 focus:outline-none focus:ring-2 focus:ring-[#4ba3d0]"
                />
              </div>
            </div>

            {/* Terms checkbox */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input type="checkbox" name="agreeToTerms" className="h-5 w-5 shrink-0 rounded accent-[#118a80]" />
                <span className="text-[#10292e] text-xs font-medium">
                  I agree to the Terms and Privacy Policy
                </span>
              </label>
              {errors.agreeToTerms?.[0] && (
                <p className="text-xs text-red-500 font-semibold mt-1">{errors.agreeToTerms[0]}</p>
              )}
            </div>

            {/* Submit */}
            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#7ccbf0] hover:brightness-95 active:scale-[0.98] text-[#10292e] font-bold text-sm py-3 rounded-full cursor-pointer transition-all shadow-sm flex items-center justify-center disabled:opacity-70"
              >
                {loading ? "Creating Parent Account..." : "Create Parent Account"}
              </button>
            </div>

            <p className="text-center text-xs text-[#5a6e70] pt-2">
              Already have an account?{" "}
              <Link
                href="/login?role=parent"
                className="font-bold text-[#4ba3d0] hover:underline"
              >
                Log in as Parent
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
