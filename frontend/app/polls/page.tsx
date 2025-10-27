"use client";

import { useEffect, useState } from "react";
import { PollList } from "@/components/polls/PollList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePolls } from "@/hooks/usePolls";
import { useWebSocketContext } from "@/components/WebSocketProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PlusCircle, RefreshCw, Wifi, WifiOff, ArrowLeft, Search } from "lucide-react";
import Link from "next/link";
import PixelBlast from "@/components/PixelBlast";
import { Input } from "@/components/ui/input";

export default function PollsPage() {
  const { polls, isLoading, error, refresh } = usePolls();
  const { isConnected } = useWebSocketContext();
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Filter polls based on search query
  const filteredPolls = polls.filter(poll => 
    poll.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (poll.description && poll.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  // Listen for WebSocket events
  useEffect(() => {
    const handlePollCreated = () => {
      console.log("New poll created, refreshing list...");
      refresh();
    };

    const handleVoteUpdate = () => {
      console.log("Vote update received, refreshing list...");
      refresh();
    };

    const handleLikeUpdate = () => {
      console.log("Like update received, refreshing list...");
      refresh();
    };

    window.addEventListener("poll_created", handlePollCreated);
    window.addEventListener("vote_update", handleVoteUpdate);
    window.addEventListener("like_update", handleLikeUpdate);

    return () => {
      window.removeEventListener("poll_created", handlePollCreated);
      window.removeEventListener("vote_update", handleVoteUpdate);
      window.removeEventListener("like_update", handleLikeUpdate);
    };
  }, [refresh]);

  return (
    <ErrorBoundary>
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

        <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-6">
            <div>
              <div className="flex items-center gap-3">
                <Link href="/">
                  <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Home
                  </Button>
                </Link>
                <h1 className="text-4xl font-bold text-white">All Polls</h1>
            {mounted && (
              <Badge variant={isConnected ? "default" : "secondary"} className="gap-1">
                {isConnected ? (
                  <>
                    <Wifi className="h-3 w-3" />
                    Live
                  </>
                ) : (
                  <>
                    <WifiOff className="h-3 w-3" />
                    Offline
                  </>
                )}
              </Badge>
            )}
            </div>
            <p className="text-white/70 mt-2">
              Browse and vote on polls in real-time
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={refresh}
              disabled={isLoading}
              className="border-white/30 text-white hover:bg-white/10"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            </Button>
            <Link href="/create">
              <Button className="bg-white text-black hover:bg-white/90">
                <PlusCircle className="h-4 w-4 mr-2" />
                Create Poll
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/50" />
          <Input
            type="text"
            placeholder="Search polls..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white/10 border-white/20 text-white placeholder:text-white/50 focus:bg-white/15"
          />
        </div>
      </div>

        {/* Poll List */}
        <PollList polls={filteredPolls} isLoading={isLoading} error={error} />
        </div>
      </div>
    </div>
    </ErrorBoundary>
  );
}
