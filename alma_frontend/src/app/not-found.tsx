import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 text-center">
      <h2 className="text-4xl font-bold text-gray-900 mb-2">404</h2>
      <p className="text-gray-600 mb-6">Page Not Found</p>
      <Link
        href="/"
        className="px-4 py-2 bg-[#16A34A] text-white rounded-lg hover:bg-green-700 transition"
      >
        Return Home
      </Link>
    </div>
  );
}
