import type { LessonBlock } from "@/types/Lesson.type";

export default function LessonBlocks({ blocks }: { blocks: LessonBlock[] }) {
  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        if (block.type === "paragraph")
          return (
            <p
              key={index}
              className="whitespace-pre-line text-sm leading-7 text-[#607274]"
            >
              {block.text}
            </p>
          );
        if (block.type === "code")
          return (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-[#1b3438] bg-[#0b1a1c]"
            >
              <div className="border-b border-[#1b3438] px-4 py-2 text-[10px] font-bold uppercase tracking-wider text-[#9db7b9]">
                {block.language || "Code"}
              </div>
              <pre className="overflow-x-auto p-4 font-mono text-xs leading-6 text-[#a4efb3]">
                <code>{block.code}</code>
              </pre>
              {block.expected_output != null && (
                <div className="border-t border-[#1b3438] px-4 py-3">
                  <p className="mb-1 text-[10px] font-bold uppercase tracking-wider text-[#9db7b9]">
                    Expected output
                  </p>
                  <pre className="overflow-x-auto font-mono text-xs leading-6 text-white">
                    {block.expected_output}
                  </pre>
                </div>
              )}
            </div>
          );
        if (block.type === "list")
          return (
            <ul
              key={index}
              className="list-disc space-y-2 pl-5 text-sm leading-7 text-[#607274]"
            >
              {block.items?.map((item, itemIndex) => (
                <li key={itemIndex}>{item}</li>
              ))}
            </ul>
          );
        if (block.type === "callout")
          return (
            <div
              key={index}
              className="rounded-2xl border border-[#fae2b8] bg-[#fff8ec] p-4"
            >
              <p className="mb-1 text-[10px] font-extrabold uppercase tracking-wider text-[#a9630d]">
                {block.callout_type || "Note"}
              </p>
              <p className="whitespace-pre-line text-sm leading-7 text-[#10292e]">
                {block.text}
              </p>
            </div>
          );
        return null;
      })}
    </div>
  );
}
