import axios from "axios";
import { Poll, PollDetail, PollCreate, VoteCreate, VoteResponse, LikeResponse } from "@/types/poll";
import { AuthToken, LoginCredentials, RegisterData, GoogleAuthRequest, User } from "@/types/auth";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true, // Important for session cookies
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem("access_token");
      localStorage.removeItem("user");
      // Optionally redirect to login
      // window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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

// Authentication
export const register = async (data: RegisterData): Promise<AuthToken> => {
  const response = await api.post<AuthToken>("/api/auth/register", data);
  return response.data;
};

export const login = async (credentials: LoginCredentials): Promise<AuthToken> => {
  const response = await api.post<AuthToken>("/api/auth/login", credentials);
  return response.data;
};

export const googleAuth = async (credential: string): Promise<AuthToken> => {
  const response = await api.post<AuthToken>("/api/auth/google", { credential });
  return response.data;
};

export const getCurrentUser = async (): Promise<User> => {
  const response = await api.get<User>("/api/auth/me");
  return response.data;
};

export const logout = async (): Promise<void> => {
  await api.post("/api/auth/logout");
};
