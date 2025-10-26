"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { WebSocketMessage } from "@/types/poll";

interface WebSocketContextType {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
}

const WebSocketContext = createContext<WebSocketContextType>({
  isConnected: false,
  lastMessage: null,
});

export function useWebSocketContext() {
  return useContext(WebSocketContext);
}

interface WebSocketProviderProps {
  children: ReactNode;
}

export function WebSocketProvider({ children }: WebSocketProviderProps) {
  const { isConnected, lastMessage } = useWebSocket();

  useEffect(() => {
    if (lastMessage) {
      console.log("WebSocket message received:", lastMessage);
      
      // Handle different message types
      switch (lastMessage.type) {
        case "connected":
          console.log("Connected to WebSocket server");
          break;
        case "poll_created":
          console.log("New poll created:", lastMessage.data);
          // Trigger a custom event that components can listen to
          window.dispatchEvent(
            new CustomEvent("poll_created", { detail: lastMessage.data })
          );
          break;
        case "vote_update":
          console.log("Vote update:", lastMessage.data);
          window.dispatchEvent(
            new CustomEvent("vote_update", { detail: lastMessage.data })
          );
          break;
        case "like_update":
          console.log("Like update:", lastMessage.data);
          window.dispatchEvent(
            new CustomEvent("like_update", { detail: lastMessage.data })
          );
          break;
      }
    }
  }, [lastMessage]);

  return (
    <WebSocketContext.Provider value={{ isConnected, lastMessage }}>
      {children}
    </WebSocketContext.Provider>
  );
}
