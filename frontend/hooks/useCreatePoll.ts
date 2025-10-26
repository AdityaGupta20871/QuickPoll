import { useState } from "react";
import { useRouter } from "next/navigation";
import { createPoll as createPollAPI } from "@/lib/api";
import { PollCreate } from "@/types/poll";

export function useCreatePoll() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const createPoll = async (data: PollCreate) => {
    setIsLoading(true);
    setError(null);

    try {
      const poll = await createPollAPI(data);
      
      // Show success message (you can use toast here)
      alert(`Poll "${poll.title}" created successfully!`);
      
      // Redirect to homepage to see the new poll
      router.push("/");
      
      return poll;
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        "Failed to create poll";
      setError(errorMessage);
      console.error("Create poll error:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    createPoll,
    isLoading,
    error,
  };
}
