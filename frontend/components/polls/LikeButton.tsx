"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useLike } from "@/hooks/useLike";

interface LikeButtonProps {
  pollId: number;
  initialLiked: boolean;
  initialCount: number;
  onLikeChange?: (liked: boolean, newCount: number) => void;
}

export function LikeButton({
  pollId,
  initialLiked,
  initialCount,
  onLikeChange,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialCount);
  const { toggleLike, isLoading } = useLike();

  useEffect(() => {
    setIsLiked(initialLiked);
    setLikeCount(initialCount);
  }, [initialLiked, initialCount]);

  const handleClick = async () => {
    const previousLiked = isLiked;
    const previousCount = likeCount;

    // Optimistic update
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);

    try {
      const result = await toggleLike(pollId, isLiked);
      
      if (onLikeChange) {
        onLikeChange(result.liked, result.liked ? likeCount + 1 : likeCount - 1);
      }
    } catch (error) {
      // Revert on error
      setIsLiked(previousLiked);
      setLikeCount(previousCount);
    }
  };

  return (
    <Button
      variant={isLiked ? "default" : "outline"}
      size="sm"
      onClick={handleClick}
      disabled={isLoading}
      className={`gap-2 transition-all btn-press hover-lift ${
        isLiked ? "bg-red-500 hover:bg-red-600 animate-scale-pulse" : ""
      }`}
    >
      <Heart
        className={`h-4 w-4 ${isLiked ? "fill-current" : ""}`}
      />
      <span>{likeCount}</span>
    </Button>
  );
}
