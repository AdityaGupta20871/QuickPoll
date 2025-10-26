"use client";

import { useEffect } from "react";
import { PollList } from "@/components/polls/PollList";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { usePolls } from "@/hooks/usePolls";
import { useWebSocketContext } from "@/components/WebSocketProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { PlusCircle, RefreshCw, Wifi, WifiOff } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { polls, isLoading, error, refresh } = usePolls();
  const { isConnected } = useWebSocketContext();

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
    <div className="relative container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-fade-in">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-4xl font-bold">QuickPoll</h1>
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
          </div>
          <p className="text-muted-foreground mt-2">
            Create and vote on polls in real-time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={refresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
          <Link href="/create">
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              Create Poll
            </Button>
          </Link>
        </div>
      </div>

      {/* Poll List */}
      <PollList polls={polls} isLoading={isLoading} error={error} />
    </div>
    </ErrorBoundary>
  );
}
