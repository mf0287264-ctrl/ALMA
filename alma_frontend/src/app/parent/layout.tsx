import React from "react";
import ParentSidebar from "@/components/ParentSidebar";

export const metadata = {
  title: "Parent Portal | ALMA",
  description: "Monitor and support your children's learning journey on ALMA Academy",
};

export default function ParentLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fffdf9] flex text-[#10292e]">
      <ParentSidebar />
      <main className="flex-1 lg:ml-64 w-full min-h-screen pt-16 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
