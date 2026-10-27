import React from "react";
import MangoIcon from "@/components/MangoIcon";

export default function ChatIllustration() {
  return (
    <div className="flex flex-col items-center justify-end select-none w-full max-w-sm px-4">
      {/* User Chat Bubble (Top - Dark) */}
      <div className="self-end mr-4 sm:mr-8 mb-3 bg-[#10292e] text-white text-xs sm:text-sm font-medium px-5 py-2.5 rounded-full shadow-sm">
        Why does my loop run forever?
      </div>

      {/* AI Teacher Chat Bubble (Middle - White) */}
      <div className="self-start ml-2 sm:ml-4 mb-6 bg-white text-[#10292e] text-xs sm:text-sm font-medium px-5 py-2.5 rounded-full shadow-sm max-w-[92%] sm:max-w-none">
        Good question! Let&apos;s check the stop condition together.
      </div>

      {/* Mascot at the bottom */}
      <div className="mt-2">
        <MangoIcon size={170} animated className="drop-shadow-md" />
      </div>
    </div>
  );
}
