import Link from "next/link";

export default function HomePage() {
  return (
    <main className="w-11/12 mx-auto py-16 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-4">
        Welcome to <span className="text-[#16A34A]">ALMA</span>
      </h1>
      <p className="text-gray-600 max-w-md mb-8">
        Your platform built with Next.js 16, TypeScript, and Tailwind CSS.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-2.5 rounded-lg bg-[#16A34A] text-white font-medium hover:bg-green-700 transition"
        >
          Sign In
        </Link>
        <Link
          href="/register"
          className="px-6 py-2.5 rounded-lg border border-gray-300 font-medium hover:bg-gray-50 transition"
        >
          Register
        </Link>
      </div>
    </main>
  );
}
