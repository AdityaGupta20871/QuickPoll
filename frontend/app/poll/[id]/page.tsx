"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
import PixelBlast from "@/components/PixelBlast";

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
      <div className="relative min-h-screen w-full overflow-hidden bg-black">
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
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto">
            <div className="animate-pulse space-y-4">
              <div className="h-8 bg-white/10 rounded w-1/4"></div>
              <div className="h-32 bg-white/10 rounded"></div>
              <div className="h-64 bg-white/10 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="relative min-h-screen w-full overflow-hidden bg-black">
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
        <div className="relative z-10 container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl font-bold mb-4 text-white">Poll not found</h2>
            <p className="text-white/70 mb-6">{error || "This poll doesn't exist."}</p>
            <Link href="/">
              <Button className="bg-white text-black hover:bg-white/90">Back to Home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

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

        <div className="container mx-auto px-4 py-8">
          <div className="max-w-3xl mx-auto space-y-6">
            {/* Back button */}
            <Link href="/">
              <Button variant="ghost" size="sm" className="text-white/80 hover:text-white hover:bg-white/10">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>

        {/* Poll Header */}
        <Card className="bg-white/5 border-white/10">
          <CardHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <CardTitle className="text-3xl text-white">{poll.title}</CardTitle>
                {poll.description && (
                  <CardDescription className="mt-2 text-base text-white/70">
                    {poll.description}
                  </CardDescription>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 pt-4 text-sm">
              <div className="flex items-center gap-1 text-white/70">
                <Users className="h-4 w-4" />
                <span>{poll.total_votes} votes</span>
              </div>
              <LikeButton
                pollId={poll.id}
                initialLiked={poll.user_liked}
                initialCount={poll.total_likes}
                onLikeChange={loadPoll}
              />
              <Badge variant="outline" className="ml-auto border-white/20 text-white/80">
                {new Date(poll.created_at).toLocaleDateString()}
              </Badge>
            </div>
          </CardHeader>
        </Card>

            {/* Voting Interface */}
            <VotingInterface poll={poll} onVoteSuccess={handleVoteSuccess} />

            <Separator className="bg-white/20" />

            {/* Poll Results */}
            <PollResults poll={poll} />
          </div>
        </div>
      </div>
    </div>
  );
}
