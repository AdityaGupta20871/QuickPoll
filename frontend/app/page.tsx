"use client";

import { PollList } from "@/components/polls/PollList";
import { Button } from "@/components/ui/button";
import { usePolls } from "@/hooks/usePolls";
import { PlusCircle, RefreshCw } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const { polls, isLoading, error, refresh } = usePolls();

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold">QuickPoll</h1>
          <p className="text-muted-foreground mt-2">
            Create and vote on polls in real-time
          </p>
        </div>
        <div className="flex gap-2">
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
  );
}
