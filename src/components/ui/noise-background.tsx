"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface NoiseBackgroundProps {
  className?: string;
  children?: React.ReactNode;
  opacity?: number;
  size?: number;
  animation?: boolean;
}

export const NoiseBackground = ({
  className,
  children,
  opacity = 0.03,
  size = 200,
  animation = true,
}: NoiseBackgroundProps) => {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        className
      )}
    >
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 ${size} ${size}' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          opacity,
          animation: animation ? "noise 20s steps(10) infinite" : "none",
        }}
      />
      {children}
    </div>
  );
};
