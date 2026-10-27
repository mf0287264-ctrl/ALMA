"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import MangoIcon from "@/components/MangoIcon";
import { registerAction } from "./register.action";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rePassword, setRePassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    name?: string[];
    email?: string[];
    password?: string[];
    rePassword?: string[];
    agreeToTerms?: string[];
  }>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Client validation for immediate feedback
    const newErrors: typeof errors = {};
    if (!name.trim()) {
      newErrors.name = ["Full name is required"];
    }
    if (!email.includes("@") || !email.includes(".")) {
      newErrors.email = ["Enter a valid email address."];
    }
    if (password.length < 8) {
      newErrors.password = ["At least 8 characters"];
    }
    if (password !== rePassword) {
      newErrors.rePassword = ["Passwords don't match."];
    }
    if (!agreeToTerms) {
      newErrors.agreeToTerms = ["Please agree to the Terms and Privacy Policy"];
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const result = await registerAction({
        name,
        email,
        password,
        rePassword,
        agreeToTerms,
      });

      if (result.success) {
        toast.success("Account created successfully!");
        router.push("/register/step-2");
      } else {
        setErrors(result.errors || {});
        toast.error("Please correct the errors in the form.");
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex bg-[#fff8ec]">
      {/* Left Column (Desktop Only: lg and up) */}
      <div className="hidden lg:flex lg:w-1/2 min-h-screen bg-[#118a80] flex-col items-center justify-center p-12 text-center select-none">
        <div className="transform hover:scale-105 transition-transform duration-300">
          <MangoIcon size={190} animated className="drop-shadow-lg" />
        </div>
        <h1 className="text-4xl font-extrabold text-white tracking-tight mt-7">
          Start small
        </h1>
        <p className="text-white/95 text-base mt-2 font-medium">
          The first win arrives in under two minutes.
        </p>
      </div>

      {/* Right Column (Mobile, Tablet & Desktop) */}
      <div className="w-full lg:w-1/2 min-h-screen bg-[#fff8ec] flex flex-col justify-center items-center px-6 sm:px-12 md:px-16 py-10 sm:py-14">
        <div className="w-full max-w-[370px] sm:max-w-[400px]">
          {/* Header Section */}
          <div className="mb-5">
            <div className="mb-3">
              <MangoIcon size={46} animated className="drop-shadow-sm" />
            </div>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#10292e] tracking-tight">
              Create your account
            </h2>
            <p className="text-[#5a6e70] text-sm font-semibold mt-1">
              Step 1 of 3
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Full Name */}
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-bold text-[#10292e] mb-1.5"
              >
                Full name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="Layla Hassan"
                className={`w-full rounded-2xl bg-white px-4 py-3.5 text-sm text-[#10292e] placeholder:text-[#5a6e70]/60 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)] focus:outline-none ${
                  errors.name
                    ? "border-2 border-[#cc4d4c] focus:ring-2 focus:ring-[#cc4d4c]/20"
                    : "border border-[#d2dcd7] focus:ring-2 focus:ring-[#118a80] focus:border-transparent"
                }`}
              />
              {errors.name?.[0] && (
                <p className="text-xs text-[#cc4d4c] font-semibold mt-1">
                  {errors.name[0]}
                </p>
              )}
            </div>

            {/* Email */}
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                }}
                placeholder="layla@"
                className={`w-full rounded-2xl bg-white px-4 py-3.5 text-sm text-[#10292e] placeholder:text-[#5a6e70]/60 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)] focus:outline-none ${
                  errors.email
                    ? "border-2 border-[#cc4d4c] focus:ring-2 focus:ring-[#cc4d4c]/20"
                    : "border border-[#d2dcd7] focus:ring-2 focus:ring-[#118a80] focus:border-transparent"
                }`}
              />
              {errors.email?.[0] && (
                <p className="text-xs text-[#cc4d4c] font-semibold mt-1">
                  {errors.email[0]}
                </p>
              )}
            </div>

            {/* Password */}
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
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((prev) => ({ ...prev, password: undefined }));
                  }}
                  placeholder="••••••"
                  className={`w-full rounded-2xl bg-white pl-4 pr-16 py-3.5 text-sm text-[#10292e] placeholder:text-[#5a6e70]/60 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)] focus:outline-none ${
                    errors.password
                      ? "border-2 border-[#cc4d4c] focus:ring-2 focus:ring-[#cc4d4c]/20"
                      : "border border-[#d2dcd7] focus:ring-2 focus:ring-[#118a80] focus:border-transparent"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 text-sm font-bold text-[#118a80] hover:text-[#0b6b63] transition-colors cursor-pointer select-none"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <p
                className={`text-xs mt-1 font-medium ${
                  errors.password ? "text-[#cc4d4c] font-semibold" : "text-[#5a6e70]"
                }`}
              >
                {errors.password?.[0] || "At least 8 characters"}
              </p>
            </div>

            {/* Confirm Password */}
            <div>
              <label
                htmlFor="rePassword"
                className="block text-sm font-bold text-[#10292e] mb-1.5"
              >
                Confirm password
              </label>
              <input
                id="rePassword"
                type={showPassword ? "text" : "password"}
                value={rePassword}
                onChange={(e) => {
                  setRePassword(e.target.value);
                  if (errors.rePassword)
                    setErrors((prev) => ({ ...prev, rePassword: undefined }));
                }}
                placeholder="••••••••"
                className={`w-full rounded-2xl bg-white px-4 py-3.5 text-sm text-[#10292e] placeholder:text-[#5a6e70]/60 transition-all shadow-[0_1px_2px_rgba(0,0,0,0.03)] focus:outline-none ${
                  errors.rePassword
                    ? "border-2 border-[#cc4d4c] focus:ring-2 focus:ring-[#cc4d4c]/20"
                    : "border border-[#d2dcd7] focus:ring-2 focus:ring-[#118a80] focus:border-transparent"
                }`}
              />
              {errors.rePassword?.[0] && (
                <p className="text-xs text-[#cc4d4c] font-semibold mt-1">
                  {errors.rePassword[0]}
                </p>
              )}
            </div>

            {/* Terms and Privacy Policy Checkbox */}
            <div className="pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <button
                  type="button"
                  role="checkbox"
                  aria-checked={agreeToTerms}
                  onClick={() => {
                    const next = !agreeToTerms;
                    setAgreeToTerms(next);
                    if (errors.agreeToTerms)
                      setErrors((prev) => ({ ...prev, agreeToTerms: undefined }));
                  }}
                  className={`w-5 h-5 rounded-md border-2 transition-all flex items-center justify-center shrink-0 cursor-pointer ${
                    agreeToTerms
                      ? "bg-[#118a80] border-[#118a80] text-white"
                      : "border-[#118a80] bg-white hover:border-[#0b6b63]"
                  }`}
                >
                  {agreeToTerms && (
                    <svg
                      className="w-3.5 h-3.5 stroke-current"
                      viewBox="0 0 16 16"
                      fill="none"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M3.5 8.5L6.5 11.5L12.5 4.5" />
                    </svg>
                  )}
                </button>
                <span className="text-[#10292e] text-sm font-medium">
                  I agree to the Terms and Privacy Policy
                </span>
              </label>
              {errors.agreeToTerms?.[0] && (
                <p className="text-xs text-[#cc4d4c] font-semibold mt-1">
                  {errors.agreeToTerms[0]}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#ffa11f] hover:brightness-95 active:scale-[0.98] text-[#10292e] font-bold text-base py-3.5 rounded-full cursor-pointer transition-all shadow-sm flex items-center justify-center disabled:opacity-70 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#ffa11f]"
              >
                {loading ? "Creating account..." : "Create account"}
              </button>
            </div>

            {/* Footer Link */}
            <p className="text-center text-sm text-[#5a6e70] pt-2">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-bold text-[#0b6b63] hover:text-[#084e48] hover:underline transition-colors"
              >
                Log in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
}
