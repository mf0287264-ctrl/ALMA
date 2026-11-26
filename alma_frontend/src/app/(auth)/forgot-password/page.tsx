import Link from "next/link";
import MangoIcon from "@/components/MangoIcon";

export default function ForgotPasswordPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[#fff8ec] px-6 py-12">
      <div className="w-full max-w-md">
        <MangoIcon size={70} className="mb-6" />
        <h1 className="text-3xl font-extrabold text-[#10292e]">Need help logging in?</h1>
        <p className="mt-4 text-base leading-relaxed text-[#5a6e70]">
          Contact your school administrator to reset your password. Give them the email address you used for your ALMA account.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-[#5a6e70]">
          Choose the same account type you selected when you registered.
        </p>
        <div className="mt-8 space-y-3">
          <Link href="/login?role=student" className="block rounded-full bg-[#ffa11f] px-6 py-3 text-center font-bold text-[#10292e]">Student login</Link>
          <Link href="/login?role=teacher" className="block rounded-full border border-[#d2dcd7] bg-white px-6 py-3 text-center font-bold text-[#10292e]">Teacher login</Link>
          <Link href="/login?role=parent" className="block rounded-full border border-[#d2dcd7] bg-white px-6 py-3 text-center font-bold text-[#10292e]">Parent login</Link>
        </div>
      </div>
    </div>
  );
}
