from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from websocket.connection_manager import manager
import uuid

router = APIRouter(tags=["websocket"])


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    """
    WebSocket endpoint for real-time updates.
    Clients connect here to receive live poll updates.
    """
    # Generate unique client ID
    client_id = str(uuid.uuid4())
    
    # Accept connection
    await manager.connect(websocket, client_id)
    
    try:
        # Send welcome message
        await manager.send_personal_message({
            "type": "connected",
            "data": {
                "client_id": client_id,
                "message": "Connected to QuickPoll WebSocket"
            }
        }, client_id)
        
        # Keep connection alive and listen for messages
        while True:
            # Receive message from client
            data = await websocket.receive_text()
            
            # Echo back or handle client messages if needed
            # For now, we just keep the connection alive
            # The broadcasting happens from the API endpoints
            
    except WebSocketDisconnect:
        manager.disconnect(client_id)
    except Exception as e:
        print(f"WebSocket error for client {client_id}: {e}")
        manager.disconnect(client_id)
