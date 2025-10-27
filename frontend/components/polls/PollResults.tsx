"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PollDetail } from "@/types/poll";

interface PollResultsProps {
  poll: PollDetail;
}

export function PollResults({ poll }: PollResultsProps) {
  const totalVotes = poll.total_votes || 0;

  return (
    <Card className="animate-fade-in bg-white/5 border-white/10">
      <CardHeader>
        <CardTitle className="text-white">Results</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {poll.options.map((option) => {
          const percentage = totalVotes > 0 
            ? Math.round((option.vote_count / totalVotes) * 100) 
            : 0;

          return (
            <div key={option.id} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-white">{option.option_text}</span>
                <span className="text-white/70">
                  {option.vote_count} votes ({percentage}%)
                </span>
              </div>
              <Progress value={percentage} className="h-2 animate-progress" />
            </div>
          );
        })}

        <div className="pt-4 border-t border-white/10 text-center text-sm text-white/70">
          Total votes: {totalVotes}
        </div>
      </CardContent>
    </Card>
  );
}
