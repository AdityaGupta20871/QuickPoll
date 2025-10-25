from fastapi import WebSocket
from typing import Dict, List
import json


class ConnectionManager:
    """Manages WebSocket connections and broadcasts"""
    
    def __init__(self):
        # Store active connections: {client_id: WebSocket}
        self.active_connections: Dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, client_id: str):
        """Accept and store a new WebSocket connection"""
        await websocket.accept()
        self.active_connections[client_id] = websocket
        print(f"Client {client_id} connected. Total connections: {len(self.active_connections)}")
    
    def disconnect(self, client_id: str):
        """Remove a WebSocket connection"""
        if client_id in self.active_connections:
            del self.active_connections[client_id]
            print(f"Client {client_id} disconnected. Total connections: {len(self.active_connections)}")
    
    async def send_personal_message(self, message: dict, client_id: str):
        """Send a message to a specific client"""
        if client_id in self.active_connections:
            websocket = self.active_connections[client_id]
            await websocket.send_json(message)
    
    async def broadcast(self, message: dict, exclude_client: str = None):
        """Broadcast a message to all connected clients"""
        disconnected_clients = []
        
        for client_id, websocket in self.active_connections.items():
            # Skip the client who triggered the event if specified
            if exclude_client and client_id == exclude_client:
                continue
            
            try:
                await websocket.send_json(message)
            except Exception as e:
                print(f"Error sending to client {client_id}: {e}")
                disconnected_clients.append(client_id)
        
        # Clean up disconnected clients
        for client_id in disconnected_clients:
            self.disconnect(client_id)
    
    async def broadcast_poll_created(self, poll_data: dict):
        """Broadcast when a new poll is created"""
        message = {
            "type": "poll_created",
            "data": poll_data
        }
        await self.broadcast(message)
    
    async def broadcast_vote_update(self, poll_id: int, option_id: int, vote_count: int, total_votes: int):
        """Broadcast when a vote is cast"""
        message = {
            "type": "vote_update",
            "data": {
                "poll_id": poll_id,
                "option_id": option_id,
                "vote_count": vote_count,
                "total_votes": total_votes
            }
        }
        await self.broadcast(message)
    
    async def broadcast_like_update(self, poll_id: int, total_likes: int, action: str):
        """Broadcast when a poll is liked/unliked"""
        message = {
            "type": "like_update",
            "data": {
                "poll_id": poll_id,
                "total_likes": total_likes,
                "action": action  # "liked" or "unliked"
            }
        }
        await self.broadcast(message)


# Global connection manager instance
manager = ConnectionManager()
