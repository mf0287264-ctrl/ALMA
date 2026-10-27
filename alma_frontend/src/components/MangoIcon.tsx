import React from "react";

export interface MangoIconProps extends React.SVGProps<SVGSVGElement> {
  size?: number | string;
  className?: string;
  animated?: boolean;
}

export default function MangoIcon({
  size = 180,
  className = "",
  animated = false,
  ...props
}: MangoIconProps) {
  return (
    <svg
      width={size}
      height={typeof size === "number" ? Math.round((size * 190) / 170) : size}
      viewBox="0 0 170 190"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`select-none ${animated ? "transition-transform hover:scale-105 duration-300" : ""} ${className}`}
      {...props}
    >
      {/* Mango Orange Arch Body (148w x 170h, arch top radius 74, flat bottom) */}
      <path
        d="M11 84 C11 43.13 44.13 10 85 10 C125.87 10 159 43.13 159 84 V179 H11 V84 Z"
        fill="#ffa11f"
      />

      {/* Tilted Rounded Accent / Leaf on top-right shoulder */}
      <rect
        x="117"
        y="13"
        width="24"
        height="24"
        rx="6"
        transform="rotate(16 129 25)"
        fill="#10292e"
      />

      {/* Dark Visor / Face Area */}
      <rect
        x="32"
        y="63"
        width="106"
        height="90"
        rx="45"
        fill="#10292e"
      />

      {/* Eyes: Vertical Cream Pills */}
      <g className={animated ? "animate-pulse" : ""}>
        <rect
          x="55"
          y="94"
          width="15"
          height="28"
          rx="7.5"
          fill="#fff8ec"
        />
        <rect
          x="100"
          y="94"
          width="15"
          height="28"
          rx="7.5"
          fill="#fff8ec"
        />
      </g>
    </svg>
  );
}
