import React from "react";

interface LogoProps {
  className?: string;
  isDark?: boolean;
}

export default function Logo({ className = "", isDark = false }: LogoProps) {
  const color = isDark ? "white" : "#1a1a1a";

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`}>
      {/* Precision Hand-Coded Multi-Line Geometric Monogram */}
      <svg 
        viewBox="0 0 110 105" 
        fill="none" 
        stroke={color} 
        strokeWidth="3.5" 
        strokeLinejoin="miter" 
        strokeLinecap="square"
        className="w-full h-full drop-shadow-sm mb-1"
      >
        {/* Top-Left 'E' Shape Bars */}
        <path d="M 8 16 H 24 M 8 26 H 24 M 8 36 H 24" />

        {/* 'D' Vertical Spines */}
        <path d="M 8 46 V 90" />
        <path d="M 16 36 V 90" />
        <path d="M 24 26 V 90" />
        <path d="M 32 16 V 90" />

        {/* 'D' Concentric Arcs */}
        {/* A rx ry x-axis-rotation large-arc-flag sweep-flag x y */}
        {/* Arc 1 (Radius 37): Center y=53 */}
        <path d="M 32 16 A 37 37 0 0 1 32 90" />
        {/* Arc 2 (Radius 27): Center y=53. Path from y=26 to 80. */}
        <path d="M 32 26 A 27 27 0 0 1 32 80" />
        {/* Arc 3 (Radius 17): Center y=53. Path from y=36 to 70. */}
        <path d="M 32 36 A 17 17 0 0 1 32 70" />
        {/* Arc 4 (Radius 7): Center y=53. Path from y=46 to 60. */}
        <path d="M 32 46 A 7 7 0 0 1 32 60" />

        {/* 'R' Vertical Spines */}
        <path d="M 64 16 V 42" />
        <path d="M 72 16 V 48" />
        <path d="M 80 16 V 54" />

        {/* 'R' Concentric Top Loops */}
        {/* Arc 1 (Outer, Radius 19): Center y=35. Path from y=16 to 54. */}
        <path d="M 80 16 A 19 19 0 0 1 80 54" />
        {/* Arc 2 (Middle, Radius 13): Center y=35. Path from y=22 to 48. */}
        {/* Wait, horizontal connection to spine 2 */}
        <path d="M 72 22 H 80 M 80 22 A 13 13 0 0 1 80 48 H 72" />
        {/* Arc 3 (Inner, Radius 7): Center y=35. Path from y=28 to 42. */}
        <path d="M 64 28 H 80 M 80 28 A 7 7 0 0 1 80 42 H 64" />

        {/* 'R' Diagonal Legs */}
        <path d="M 64 42 L 83 90" />
        <path d="M 72 48 L 88.6 90" />
        <path d="M 80 54 L 94.2 90" />
      </svg>
      
      {/* Precision Typography */}
      <div 
        className={`text-center flex flex-col items-center mt-1 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
      >
        <span className="text-[20px] font-black tracking-[0.25em] leading-none uppercase" style={{ fontFamily: "Inter, sans-serif" }}>
          DOK<span className="mx-1 tracking-normal font-bold">-</span>RAN
        </span>
        <span className="text-[10px] font-bold tracking-[0.6em] leading-none mt-1.5 pl-1 uppercase text-neutral-500">
          WEARS
        </span>
      </div>
    </div>
  );
}
