export interface PollOption {
  id: number;
  option_text: string;
  vote_count: number;
}

export interface Poll {
  id: number;
  title: string;
  description: string | null;
  created_by: string;
  created_at: string;
  total_votes: number;
  total_likes: number;
}

export interface PollDetail extends Poll {
  options: PollOption[];
  user_voted: boolean;
  user_liked: boolean;
}

export interface PollCreate {
  title: string;
  description?: string;
  options: string[];
}

export interface VoteCreate {
  option_id: number;
}

export interface VoteResponse {
  id: number;
  poll_id: number;
  option_id: number;
  voted_at: string;
  message: string;
}

export interface LikeResponse {
  id: number;
  poll_id: number;
  liked_at: string;
  message: string;
}

export interface WebSocketMessage {
  type: "connected" | "poll_created" | "vote_update" | "like_update";
  data: any;
}
