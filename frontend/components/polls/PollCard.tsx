"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users } from "lucide-react";
import { Poll } from "@/types/poll";
import Link from "next/link";

interface PollCardProps {
  poll: Poll;
}

export function PollCard({ poll }: PollCardProps) {
  return (
    <Link href={`/poll/${poll.id}`}>
      <Card className="cursor-pointer card-hover animate-fade-in-scale">
        <CardHeader>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <CardTitle className="text-xl line-clamp-2">{poll.title}</CardTitle>
              {poll.description && (
                <CardDescription className="mt-2 line-clamp-2">
                  {poll.description}
                </CardDescription>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>{poll.total_votes} votes</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{poll.total_likes} likes</span>
            </div>
            <div className="ml-auto">
              <Badge variant="outline">
                {new Date(poll.created_at).toLocaleDateString()}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
