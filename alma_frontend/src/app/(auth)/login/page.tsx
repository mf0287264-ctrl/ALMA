"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import MangoIcon from "@/components/MangoIcon";
import { useAuth } from "@/app/_Context/AuthContext";
import { loginDestination } from "@/lib/auth-routes";
import { logInSchema } from "./login.schema";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const qRole = searchParams.get("role");
  const role: "student" | "teacher" | "parent" =
    qRole === "teacher" ? "teacher" : qRole === "parent" ? "parent" : "student";

  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ email?: string[]; password?: string[] }>({});
  const [submitError, setSubmitError] = useState("");

  const changeRole = (nextRole: typeof role) => {
    const query = new URLSearchParams(searchParams.toString());
    query.set("role", nextRole);
    setErrors({});
    setSubmitError("");
    router.replace(`/login?${query}`, { scroll: false });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;
    setErrors({});
    setSubmitError("");
    // Read the form itself so Safari/Password AutoFill values are included even
    // when the browser has not dispatched a React change event.
    const form = new FormData(e.currentTarget);
    const rememberMe = form.has("rememberMe");
    const parsed = logInSchema.safeParse({ email: form.get("email"), password: form.get("password") });
    if (!parsed.success) {
      setErrors(parsed.error.flatten().fieldErrors);
      return;
    }
    setLoading(true);

    try {
      const result = await login({ ...parsed.data, role, rememberMe });
      if (result.success) {
        if (role === "teacher") {
          toast.success("Welcome back, Educator!");
        } else if (role === "parent") {
          toast.success("Welcome back, Parent!");
        } else {
          toast.success("Welcome back!");
        }
        window.location.replace(new URL(loginDestination(result.role || role, searchParams.get("callbackUrl")), window.location.origin).href);
      } else {
        setSubmitError(result.error || "Unable to log in. Please try again.");
      }
    } catch {
      setSubmitError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const isTeacher = role === "teacher";
  const isParent = role === "parent";

  const brandColor = isTeacher ? "#f25c78" : isParent ? "#4ba3d0" : "#118a80";
  const accentColor = isTeacher ? "#f25c78" : isParent ? "#7ccbf0" : "#ffa11f";

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      {/* Left Column (Desktop Only: lg and up) */}
      <div
        style={{ backgroundColor: brandColor }}
        className="hidden lg:flex lg:w-1/2 min-h-screen flex-col items-center justify-center p-12 text-center select-none transition-colors duration-500 relative"
      >
        <Link
          href="/choose-role?mode=login"
          className="absolute top-8 left-8 text-white/90 hover:text-white text-sm font-semibold flex items-center gap-1.5 transition-colors"
        >
          <span>←</span> Back to Role Selection
        </Link>

        <div className="transform hover:scale-105 transition-transform duration-300">
          <MangoIcon size={190} animated className="drop-shadow-lg" />
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight mt-7">
          {isTeacher
            ? "Educator Portal"
            : isParent
            ? "Parent Portal"
            : "Welcome back"}
        </h1>
        <p className="text-white/95 text-base mt-2 font-medium max-w-sm">
          {isTeacher
            ? "Generate tailored lessons and manage your classes in minutes."
            : isParent
            ? "Follow your child's learning journey and contact their teachers directly."
            : "Keep your streak going and conquer today's coding quest."}
        </p>
      </div>

      {/* Right Column (Mobile, Tablet & Desktop) */}
      <div className="w-full lg:w-1/2 min-h-screen bg-[#fff8ec] flex flex-col justify-center items-center px-6 sm:px-12 md:px-16 py-10 sm:py-14">
        <div className="w-full max-w-[390px] sm:max-w-[420px]">
          {/* Header Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <MangoIcon size={46} animated className="drop-shadow-sm" />
              <Link
                href="/choose-role?mode=login"
                className="text-xs font-bold text-[#5a6e70] hover:text-[#10292e] flex items-center gap-1"
              >
                Change role <span>↔</span>
              </Link>
            </div>

            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
              {isTeacher
                ? "Teacher Log in"
                : isParent
                ? "Parent Log in"
                : "Student Log in"}
            </h2>
            <p className="text-[#5a6e70] text-sm sm:text-base mt-1.5">
              {isTeacher
                ? "Access your lesson generator and student dashboard."
                : isParent
                ? "Sign in to track your child's progress and achievements."
                : "Log in to keep your streak going."}
            </p>

            {/* Role Switcher Pill Tabs (3 roles: Student, Teacher, Parent) */}
            <div className="mt-4 p-1 bg-[#ebe5d8] rounded-2xl flex items-center gap-1">
              <button
                type="button"
                onClick={() => changeRole("student")}
                aria-pressed={role === "student"}
                disabled={loading}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  role === "student"
                    ? "bg-white text-[#10292e] shadow-sm"
                    : "text-[#5a6e70] hover:text-[#10292e]"
                }`}
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => changeRole("teacher")}
                aria-pressed={role === "teacher"}
                disabled={loading}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  role === "teacher"
                    ? "bg-[#f25c78] text-white shadow-sm"
                    : "text-[#5a6e70] hover:text-[#10292e]"
                }`}
              >
                🍎 Teacher
              </button>
              <button
                type="button"
                onClick={() => changeRole("parent")}
                aria-pressed={role === "parent"}
                disabled={loading}
                className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  role === "parent"
                    ? "bg-[#4ba3d0] text-white shadow-sm"
                    : "text-[#5a6e70] hover:text-[#10292e]"
                }`}
              >
                👨‍👩‍👧 Parent
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4" noValidate aria-busy={loading}>
            {submitError && (
              <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                {submitError}
              </p>
            )}
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-bold text-[#10292e] mb-1.5"
              >
                {isTeacher
                  ? "Teacher Email"
                  : isParent
                  ? "Parent Email"
                  : "Student Email"}
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="username"
                autoCapitalize="none"
                spellCheck={false}
                maxLength={254}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                placeholder={
                  isTeacher
                    ? "teacher@school.edu"
                    : isParent
                    ? "parent@family.com"
                    : "student@school.edu"
                }
                required
                className="w-full rounded-2xl border border-[#d2dcd7] bg-white px-4 py-3.5 text-sm text-[#10292e] placeholder:text-[#5a6e70]/60 focus:outline-none focus:ring-2 focus:ring-[#118a80] focus:border-transparent transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
              />
              {errors.email?.[0] && (
                <p id="email-error" className="text-xs text-red-500 font-semibold mt-1">
                  {errors.email[0]}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-bold text-[#10292e] mb-1.5"
              >
                Password
              </label>
              <div className="relative flex items-center">
                <input
                  id="password"
                  name="password"
                  autoComplete="current-password"
                  maxLength={128}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  required
                  className="w-full rounded-2xl border border-[#d2dcd7] bg-white pl-4 pr-16 py-3.5 text-sm text-[#10292e] placeholder:text-[#5a6e70]/60 focus:outline-none focus:ring-2 focus:ring-[#118a80] focus:border-transparent transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                  className="absolute right-4 text-sm font-bold text-[#118a80] hover:text-[#0b6b63] transition-colors cursor-pointer select-none"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {errors.password?.[0] && (
                <p id="password-error" className="text-xs text-red-500 font-semibold mt-1">
                  {errors.password[0]}
                </p>
              )}
            </div>

            {/* Remember me & Forgot password row */}
            <div className="flex items-center justify-between text-sm pt-1 pb-2">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="rememberMe"
                  className="h-5 w-5 shrink-0 rounded-md accent-[#118a80]"
                />
                <span className="text-[#10292e] text-sm font-medium">
                  Remember me
                </span>
              </label>

              <Link
                href="/forgot-password"
                className="text-sm font-bold text-[#0b6b63] hover:text-[#084e48] hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-1">
              <button
                type="submit"
                disabled={loading}
                style={{ backgroundColor: accentColor }}
                className="w-full hover:brightness-95 active:scale-[0.98] text-[#10292e] font-extrabold text-base py-3.5 rounded-full cursor-pointer transition-all shadow-sm flex items-center justify-center disabled:opacity-70 focus:outline-none"
              >
                {loading
                  ? "Logging in..."
                  : `Log in as ${isTeacher ? "Teacher" : isParent ? "Parent" : "Student"}`}
              </button>

              {role === "student" && (
                <Link
                  href="/class-code"
                  className="w-full bg-white hover:bg-[#fafaf8] active:scale-[0.98] border-2 border-[#10292e] text-[#10292e] font-bold text-base py-3.5 rounded-full cursor-pointer transition-all shadow-sm flex items-center justify-center text-center"
                >
                  Join with a class code
                </Link>
              )}
            </div>

            {/* Bottom Redirect Link */}
            <p className="text-center text-sm text-[#5a6e70] pt-4">
              New to ALMA?{" "}
              <Link
                href={
                  isTeacher
                    ? "/register/teacher"
                    : isParent
                    ? "/register/parent"
                    : "/choose-role?mode=register"
                }
                className="font-bold text-[#0b6b63] hover:text-[#084e48] hover:underline transition-colors"
              >
                {isTeacher
                  ? "Create Teacher Account"
                  : isParent
                  ? "Create Parent Account"
                  : "Create an account"}
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-[#fff8ec] flex items-center justify-center">
          <MangoIcon size={80} animated />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
