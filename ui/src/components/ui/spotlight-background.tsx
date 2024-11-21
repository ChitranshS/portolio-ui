import React from "react";
import { cn } from "@/lib/utils";

interface SpotlightBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export const SpotlightBackground = ({
  children,
  className,
}: SpotlightBackgroundProps) => {
  return (
    <div className={cn("relative group", className)}>
      {/* Animated background with gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#1a1c26] via-[#2a2d3d] to-[#1a1c26] opacity-80 rounded-3xl" />
      
      {/* Animated spotlight effect */}
      <div className="absolute inset-0 rounded-3xl transition duration-500">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-[#6c5dd3] via-transparent to-[#6c5dd3] opacity-20 blur-xl" />
          <div className="absolute -inset-0.5 bg-gradient-to-r from-[#6c5dd3] to-[#6c5dd3] opacity-0 group-hover:opacity-10 transition duration-500 blur-xl" />
        </div>
      </div>

      {/* Moving gradient background */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#6c5dd320,transparent_40%,transparent_60%,#6c5dd320)] group-hover:animate-shimmer" />
      </div>

      {/* Content */}
      <div className="relative">{children}</div>
    </div>
  );
};
