"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Heart, Users } from "lucide-react";
import { fetchPoll } from "@/lib/api";
import { PollDetail } from "@/types/poll";
import { VotingInterface } from "@/components/polls/VotingInterface";
import { PollResults } from "@/components/polls/PollResults";
import { LikeButton } from "@/components/polls/LikeButton";
import Link from "next/link";

export default function PollPage() {
  const params = useParams();
  const router = useRouter();
  const [poll, setPoll] = useState<PollDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Listen for WebSocket real-time updates
  useEffect(() => {
    const handleVoteUpdate = (event: any) => {
      const data = event.detail;
      if (poll && data.poll_id === poll.id) {
        console.log("Vote update for this poll, reloading...");
        loadPoll();
      }
    };

    const handleLikeUpdate = (event: any) => {
      const data = event.detail;
      if (poll && data.poll_id === poll.id) {
        console.log("Like update for this poll, reloading...");
        loadPoll();
      }
    };

    window.addEventListener("vote_update", handleVoteUpdate);
    window.addEventListener("like_update", handleLikeUpdate);

    return () => {
      window.removeEventListener("vote_update", handleVoteUpdate);
      window.removeEventListener("like_update", handleLikeUpdate);
    };
  }, [poll]);

  const loadPoll = async () => {
    if (!params.id) return;

    setIsLoading(true);
    setError(null);

    try {
      const pollId = parseInt(params.id as string);
      const data = await fetchPoll(pollId);
      setPoll(data);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        "Failed to load poll";
      setError(errorMessage);
      console.error("Fetch poll error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPoll();
  }, [params.id]);

  const handleVoteSuccess = () => {
    // Reload poll data to get updated results
    loadPoll();
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">Poll not found</h2>
          <p className="text-muted-foreground mb-6">{error || "This poll doesn't exist."}</p>
          <Link href="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Back button */}
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Polls
            </Button>
          </Link>

          {/* Poll Header */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <CardTitle className="text-3xl">{poll.title}</CardTitle>
                  {poll.description && (
                    <CardDescription className="mt-2 text-base">
                      {poll.description}
                    </CardDescription>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4 pt-4 text-sm">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{poll.total_votes} votes</span>
                </div>
                <LikeButton
                  pollId={poll.id}
                  initialLiked={poll.user_liked}
                  initialCount={poll.total_likes}
                  onLikeChange={loadPoll}
                />
                <Badge variant="outline" className="ml-auto">
                  {new Date(poll.created_at).toLocaleDateString()}
                </Badge>
              </div>
            </CardHeader>
          </Card>

          {/* Voting Interface */}
          <VotingInterface poll={poll} onVoteSuccess={handleVoteSuccess} />

          <Separator />

          {/* Poll Results */}
          <PollResults poll={poll} />
        </div>
      </div>
    </ProtectedRoute>
  );
}
