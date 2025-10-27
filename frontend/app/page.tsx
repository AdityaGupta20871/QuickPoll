"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import PixelBlast from "@/components/PixelBlast";
import Shuffle from "@/components/Shuffle";
import { Button } from "@/components/ui/button";

export default function Home() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* PixelBlast Background */}
      <div className="absolute inset-0 z-0">
        <PixelBlast
          variant="circle"
          pixelSize={3}
          color="#8B5CF6"
          patternScale={2}
          patternDensity={1}
          enableRipples={true}
          rippleSpeed={0.3}
          rippleThickness={0.1}
          speed={0.5}
          edgeFade={0.3}
        />
      </div>

      {/* Content */}
      <div className="relative z-10 flex min-h-screen flex-col">
        {/* Navbar with Glassmorphism */}
        <div className="flex justify-center px-4 py-6">
          <nav className="flex items-center justify-between px-8 py-4 max-w-2xl w-full backdrop-blur-lg bg-white/10 rounded-full border border-white/20 shadow-lg">
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold text-white">QuickPoll</div>
            </div>
            <div className="flex items-center gap-6">
              <Link href="/polls" className="text-white/80 hover:text-white transition-colors">
                Polls
              </Link>
              <Link href="/create" className="text-white/80 hover:text-white transition-colors">
                Create
              </Link>
            </div>
          </nav>
        </div>

        {/* Hero Section */}
        <div className="flex flex-1 flex-col items-center justify-center px-4 text-center">
          {/* Headline with Shuffle Animation */}
          {mounted && (
            <Shuffle
              text="QuickPoll"
              tag="h1"
              className="text-6xl md:text-7xl lg:text-8xl font-bold text-white mb-8"
              shuffleDirection="right"
              duration={0.4}
              stagger={0.04}
              threshold={0.2}
              triggerOnce={false}
            />
          )}

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-white/70 mb-12 max-w-2xl">
            Get real-time votes and make decisions faster with your audience.
          </p>

          {/* Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/create">
              <Button size="lg" className="bg-white text-black hover:bg-white/90 px-8 py-6 text-lg font-semibold">
                Create Poll
              </Button>
            </Link>
            <Link href="/polls">
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg font-semibold"
              >
                View Poll
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
