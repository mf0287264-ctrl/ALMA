import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <div className="w-full max-w-md mx-auto rounded-2xl border border-gray-100 shadow p-6 bg-white">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold">
            <span className="text-[#16A34A]">ALMA</span>
          </h1>
          <p className="text-sm text-gray-500 mt-1">Welcome Back!</p>
        </div>
        <form className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              placeholder="name@example.com"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#16A34A]"
            />
          </div>
          <button
            type="submit"
            className="w-full bg-[#16A34A] hover:bg-green-700 text-white font-semibold py-2.5 rounded-lg cursor-pointer transition-all"
          >
            Sign In
          </button>
          <div className="text-center mt-3 text-sm text-gray-500">
            Don&apos;t have an account?{" "}
            <Link href="/register" className="text-[#16A34A] hover:underline font-medium">
              Register
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
