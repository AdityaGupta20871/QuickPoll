import { useState } from "react";
import { submitVote, getUserVote } from "@/lib/api";

export function useVote() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const vote = async (pollId: number, optionId: number) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await submitVote(pollId, { option_id: optionId });
      return response;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        "Failed to submit vote";
      setError(errorMessage);
      console.error("Vote error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const checkVoteStatus = async (pollId: number) => {
    try {
      const response = await getUserVote(pollId);
      return response;
    } catch (err) {
      console.error("Check vote status error:", err);
      return { voted: false, option_id: null };
    }
  };

  return {
    vote,
    checkVoteStatus,
    isLoading,
    error,
  };
}
