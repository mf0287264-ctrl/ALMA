import React from "react";
import MangoIcon from "@/components/MangoIcon";

const LEADERBOARD_DATA = [
  { rank: 1, name: "Omar", xp: "2,310 XP" },
  { rank: 2, name: "Layla", xp: "1,840 XP" },
  { rank: 3, name: "Sara", xp: "1,620 XP" },
];

export default function LeaderboardIllustration() {
  return (
    <div className="flex flex-col items-center justify-end select-none w-full max-w-xs px-2">
      {/* Yellow Leaderboard Card */}
      <div className="w-full bg-[#ffd84a] rounded-3xl p-5 shadow-lg mb-6 transform -rotate-1 hover:rotate-0 transition-transform duration-300">
        <h3 className="text-base font-extrabold text-[#10292e] mb-3 tracking-wide">
          Leaderboard
        </h3>
        <div className="space-y-2">
          {LEADERBOARD_DATA.map((player) => (
            <div
              key={player.rank}
              className="bg-white rounded-xl py-2 px-3.5 flex items-center justify-between shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="font-extrabold text-sm text-[#10292e] w-3">
                  {player.rank}
                </span>
                <span className="font-bold text-sm text-[#10292e]">
                  {player.name}
                </span>
              </div>
              <span className="text-xs font-semibold text-[#5a6e70] tracking-wider">
                {player.xp}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Mascot at the bottom */}
      <div>
        <MangoIcon size={170} animated className="drop-shadow-md" />
      </div>
    </div>
  );
}
