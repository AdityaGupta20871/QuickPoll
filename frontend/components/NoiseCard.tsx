"use client";

import React, { ReactNode } from "react";
import Noise from "./Noise";

interface NoiseCardProps {
  children: ReactNode;
  className?: string;
  noiseAlpha?: number;
  noiseRefreshInterval?: number;
}

export function NoiseCard({ 
  children, 
  className = "", 
  noiseAlpha = 12,
  noiseRefreshInterval = 2 
}: NoiseCardProps) {
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <Noise
        patternSize={250}
        patternScaleX={1}
        patternScaleY={1}
        patternRefreshInterval={noiseRefreshInterval}
        patternAlpha={noiseAlpha}
      />
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
