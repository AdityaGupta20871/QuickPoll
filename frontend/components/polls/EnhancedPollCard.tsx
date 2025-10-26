"use client";

import { Poll } from "@/types/poll";
import { CardContainer, CardBody, CardItem } from "@/components/aceternity/3d-card";
import { Badge } from "@/components/ui/badge";
import { Heart, Users, TrendingUp } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

interface EnhancedPollCardProps {
  poll: Poll;
}

export function EnhancedPollCard({ poll }: EnhancedPollCardProps) {
  return (
    <CardContainer className="inter-var w-full">
      <CardBody className="bg-gray-950/50 relative group/card dark:hover:shadow-2xl 
        dark:hover:shadow-cyan-500/[0.1] border-white/[0.2] w-full h-auto 
        rounded-xl p-6 border backdrop-blur-sm">
        
        {/* Glowing border effect on hover */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-cyan-500/20 
          via-purple-500/20 to-pink-500/20 opacity-0 group-hover/card:opacity-100 
          transition-opacity duration-500 blur-xl" />
        
        <div className="relative z-10">
          {/* Title */}
          <CardItem translateZ="50" className="text-xl font-bold text-white">
            {poll.title}
          </CardItem>
          
          {/* Description */}
          {poll.description && (
            <CardItem 
              as="p"
              translateZ="60" 
              className="text-neutral-400 text-sm mt-2 max-w-sm line-clamp-2"
            >
              {poll.description}
            </CardItem>
          )}
          
          {/* Stats */}
          <CardItem translateZ="70" className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-sm text-cyan-400">
              <Users className="h-4 w-4" />
              <span>{poll.total_votes}</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-pink-400">
              <Heart className="h-4 w-4" />
              <span>{poll.total_likes}</span>
            </div>
            <Badge variant="outline" className="ml-auto text-xs border-white/20">
              {new Date(poll.created_at).toLocaleDateString()}
            </Badge>
          </CardItem>
          
          {/* View Button */}
          <CardItem translateZ="100" className="w-full mt-6">
            <Link href={`/poll/${poll.id}`}>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full px-4 py-2 rounded-lg bg-gradient-to-br from-cyan-500 
                  to-purple-600 text-white text-sm font-semibold shadow-lg 
                  hover:shadow-cyan-500/50 transition-all duration-300
                  flex items-center justify-center gap-2"
              >
                <TrendingUp className="h-4 w-4" />
                <span>View Results</span>
              </motion.button>
            </Link>
          </CardItem>
        </div>
        
        {/* Corner accent */}
        <div className="absolute top-0 right-0 w-20 h-20 bg-gradient-to-bl 
          from-cyan-500/20 to-transparent rounded-br-xl opacity-0 
          group-hover/card:opacity-100 transition-opacity" />
      </CardBody>
    </CardContainer>
  );
}
