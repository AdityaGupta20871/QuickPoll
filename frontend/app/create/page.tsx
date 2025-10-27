"use client";

import { CreatePollForm } from "@/components/polls/CreatePollForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import PixelBlast from "@/components/PixelBlast";

export default function CreatePollPage() {
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
      <div className="relative z-10">
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

        {/* Content Container */}
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
          
          <CreatePollForm />
        </div>
      </div>
    </div>
  );
}
