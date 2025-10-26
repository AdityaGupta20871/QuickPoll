"use client";

import { PollCard } from "./PollCard";
import { PollCardSkeleton } from "./PollCardSkeleton";
import { Poll } from "@/types/poll";
import { AlertCircle } from "lucide-react";

interface PollListProps {
  polls: Poll[];
  isLoading: boolean;
  error?: string | null;
}

export function PollList({ polls, isLoading, error }: PollListProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <PollCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold mb-2">Failed to load polls</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  if (polls.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <h3 className="text-lg font-semibold mb-2">No polls yet</h3>
        <p className="text-muted-foreground">
          Be the first to create a poll!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {polls.map((poll) => (
        <PollCard key={poll.id} poll={poll} />
      ))}
    </div>
  );
}
