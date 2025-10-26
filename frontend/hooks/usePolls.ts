import { useState, useEffect } from "react";
import { fetchPolls } from "@/lib/api";
import { Poll } from "@/types/poll";

export function usePolls() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const loadPolls = async (pageNum: number = 1) => {
    setIsLoading(true);
    setError(null);

    try {
      const data = await fetchPolls(pageNum, 10);
      setPolls(data.polls);
      setTotal(data.total);
      setPage(data.page);
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.detail ||
        err.message ||
        "Failed to load polls";
      setError(errorMessage);
      console.error("Fetch polls error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPolls();
  }, []);

  const refresh = () => {
    loadPolls(page);
  };

  return {
    polls,
    isLoading,
    error,
    page,
    total,
    refresh,
    loadPolls,
  };
}
