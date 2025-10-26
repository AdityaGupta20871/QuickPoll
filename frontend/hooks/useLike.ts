import { useState } from "react";
import { likePoll, unlikePoll, getUserLikeStatus } from "@/lib/api";

export function useLike() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleLike = async (pollId: number, currentlyLiked: boolean) => {
    setIsLoading(true);
    setError(null);

    try {
      if (currentlyLiked) {
        await unlikePoll(pollId);
        return { liked: false };
      } else {
        await likePoll(pollId);
        return { liked: true };
      }
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        "Failed to update like";
      setError(errorMessage);
      console.error("Like error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const checkLikeStatus = async (pollId: number) => {
    try {
      const response = await getUserLikeStatus(pollId);
      return response;
    } catch (err) {
      console.error("Check like status error:", err);
      return { liked: false };
    }
  };

  return {
    toggleLike,
    checkLikeStatus,
    isLoading,
    error,
  };
}
