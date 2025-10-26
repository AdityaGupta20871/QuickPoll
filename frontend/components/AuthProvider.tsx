"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User, AuthToken, LoginCredentials, RegisterData } from "@/types/auth";
import * as api from "@/lib/api";

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  loginWithGoogle: (credential: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state - prevents hydration mismatch
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Load user from localStorage and verify token on mount
  useEffect(() => {
    if (!isMounted) return;

    const loadUser = async () => {
      try {
        const storedUser = localStorage.getItem("user");
        const token = localStorage.getItem("access_token");

        if (storedUser && token) {
          // Verify token is still valid by fetching current user
          const currentUser = await api.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        // Token invalid or expired, clear storage
        localStorage.removeItem("user");
        localStorage.removeItem("access_token");
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [isMounted]);

  const handleAuthSuccess = (authToken: AuthToken) => {
    localStorage.setItem("access_token", authToken.access_token);
    localStorage.setItem("user", JSON.stringify(authToken.user));
    setUser(authToken.user);
  };

  const login = async (credentials: LoginCredentials) => {
    const authToken = await api.login(credentials);
    handleAuthSuccess(authToken);
  };

  const register = async (data: RegisterData) => {
    const authToken = await api.register(data);
    handleAuthSuccess(authToken);
  };

  const loginWithGoogle = async (credential: string) => {
    const authToken = await api.googleAuth(credential);
    handleAuthSuccess(authToken);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      localStorage.removeItem("user");
      localStorage.removeItem("access_token");
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
