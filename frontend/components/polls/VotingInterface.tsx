"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2 } from "lucide-react";
import { PollDetail } from "@/types/poll";
import { useVote } from "@/hooks/useVote";

interface VotingInterfaceProps {
  poll: PollDetail;
  onVoteSuccess?: () => void;
}

export function VotingInterface({ poll, onVoteSuccess }: VotingInterfaceProps) {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [hasVoted, setHasVoted] = useState(poll.user_voted);
  const [votedOptionId, setVotedOptionId] = useState<number | null>(null);
  const { vote, checkVoteStatus, isLoading, error } = useVote();

  useEffect(() => {
    const checkExistingVote = async () => {
      const status = await checkVoteStatus(poll.id);
      if (status.voted) {
        setHasVoted(true);
        setVotedOptionId(status.option_id);
      }
    };

    if (!poll.user_voted) {
      checkExistingVote();
    }
  }, [poll.id, poll.user_voted, checkVoteStatus]);

  const handleVote = async () => {
    if (!selectedOption) return;

    try {
      await vote(poll.id, parseInt(selectedOption));
      setHasVoted(true);
      setVotedOptionId(parseInt(selectedOption));
      
      if (onVoteSuccess) {
        onVoteSuccess();
      }
    } catch (err) {
      // Error is handled in the hook
    }
  };

  if (hasVoted) {
    return (
      <Card className="border-green-200 bg-green-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg">You've already voted!</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Thank you for participating in this poll. Check the results below.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in">
      <CardHeader>
        <CardTitle>Cast Your Vote</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <RadioGroup
          value={selectedOption}
          onValueChange={setSelectedOption}
        >
          {poll.options.map((option) => (
            <div
              key={option.id}
              className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-accent transition-colors"
            >
              <RadioGroupItem
                value={option.id.toString()}
                id={`option-${option.id}`}
              />
              <Label
                htmlFor={`option-${option.id}`}
                className="flex-1 cursor-pointer"
              >
                {option.option_text}
              </Label>
            </div>
          ))}
        </RadioGroup>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        <Button
          onClick={handleVote}
          disabled={!selectedOption || isLoading}
          className="w-full btn-press hover-lift"
        >
          {isLoading ? "Submitting..." : "Submit Vote"}
        </Button>
      </CardContent>
    </Card>
  );
}
