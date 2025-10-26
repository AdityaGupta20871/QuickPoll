import axios from "axios";
import { Poll, PollDetail, PollCreate, VoteCreate, VoteResponse, LikeResponse } from "@/types/poll";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for session cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Polls
export const fetchPolls = async (page: number = 1, pageSize: number = 10) => {
  const response = await api.get<{
    polls: Poll[];
    total: number;
    page: number;
    page_size: number;
  }>("/api/polls", {
    params: { page, page_size: pageSize },
  });
  return response.data;
};

export const fetchPoll = async (pollId: number): Promise<PollDetail> => {
  const response = await api.get<PollDetail>(`/api/polls/${pollId}`);
  return response.data;
};

export const createPoll = async (data: PollCreate): Promise<PollDetail> => {
  const response = await api.post<PollDetail>("/api/polls", data);
  return response.data;
};

// Votes
export const submitVote = async (
  pollId: number,
  data: VoteCreate
): Promise<VoteResponse> => {
  const response = await api.post<VoteResponse>(
    `/api/polls/${pollId}/vote`,
    data
  );
  return response.data;
};

export const getUserVote = async (pollId: number) => {
  const response = await api.get(`/api/polls/${pollId}/vote`);
  return response.data;
};

// Likes
export const likePoll = async (pollId: number): Promise<LikeResponse> => {
  const response = await api.post<LikeResponse>(`/api/polls/${pollId}/like`);
  return response.data;
};

export const unlikePoll = async (pollId: number) => {
  const response = await api.delete(`/api/polls/${pollId}/like`);
  return response.data;
};

export const getUserLikeStatus = async (pollId: number) => {
  const response = await api.get(`/api/polls/${pollId}/like`);
  return response.data;
};
