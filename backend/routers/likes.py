from fastapi import APIRouter, Depends, HTTPException, Response, Request, BackgroundTasks, Cookie
from sqlalchemy.orm import Session
from typing import Optional
from slowapi import Limiter
from slowapi.util import get_remote_address
from database import get_db
from models import Poll, Like
from schemas import LikeResponse, LikeDeleteResponse
from websocket.connection_manager import manager
import uuid

router = APIRouter(prefix="/api/polls", tags=["likes"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/{poll_id}/like", response_model=LikeResponse, status_code=201)
@limiter.limit("20/minute")  # Limit likes to prevent spam
async def like_poll(
    request: Request,
    poll_id: int,
    background_tasks: BackgroundTasks,
    response: Response,
    db: Session = Depends(get_db),
    session_id: Optional[str] = Cookie(default=None)
):
    """Like a poll using session-based tracking"""
    # Generate or use existing session ID
    if not session_id:
        session_id = str(uuid.uuid4())
        response.set_cookie(key="session_id", value=session_id, httponly=True, max_age=31536000)  # 1 year
    
    # Check if poll exists
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Check if session already liked
    existing_like = db.query(Like).filter(
        Like.poll_id == poll_id,
        Like.session_id == session_id
    ).first()
    
    if existing_like:
        raise HTTPException(
            status_code=400,
            detail="You have already liked this poll"
        )
    
    # Create like with session ID
    new_like = Like(
        poll_id=poll_id,
        session_id=session_id
    )
    db.add(new_like)
    db.commit()
    db.refresh(new_like)
    
    # Calculate total likes for the poll
    total_likes = len(poll.likes)
    
    # Broadcast like update to all connected clients
    background_tasks.add_task(
        manager.broadcast_like_update,
        poll_id=poll_id,
        total_likes=total_likes,
        action="liked"
    )
    
    return LikeResponse(
        id=new_like.id,
        poll_id=new_like.poll_id,
        liked_at=new_like.liked_at,
        message="Poll liked successfully"
    )


@router.delete("/{poll_id}/like", response_model=LikeDeleteResponse)
async def unlike_poll(
    poll_id: int,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    session_id: Optional[str] = Cookie(default=None)
):
    """Remove like from a poll using session-based tracking"""
    # Check if poll exists
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    if not session_id:
        raise HTTPException(
            status_code=404,
            detail="Like not found"
        )
    
    # Find existing like
    existing_like = db.query(Like).filter(
        Like.poll_id == poll_id,
        Like.session_id == session_id
    ).first()
    
    if not existing_like:
        raise HTTPException(
            status_code=404,
            detail="Like not found"
        )
    
    # Delete like
    db.delete(existing_like)
    db.commit()
    
    # Calculate total likes for the poll (after deletion)
    total_likes = len(poll.likes)
    
    # Broadcast unlike update to all connected clients
    background_tasks.add_task(
        manager.broadcast_like_update,
        poll_id=poll_id,
        total_likes=total_likes,
        action="unliked"
    )
    
    return LikeDeleteResponse(
        message="Like removed successfully",
        poll_id=poll_id
    )


@router.get("/{poll_id}/like")
def get_user_like_status(
    poll_id: int,
    db: Session = Depends(get_db),
    session_id: Optional[str] = Cookie(default=None)
):
    """Check if session has liked the poll"""
    # Check if poll exists
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    if not session_id:
        return {"liked": False}
    
    # Check if session liked
    like = db.query(Like).filter(
        Like.poll_id == poll_id,
        Like.session_id == session_id
    ).first()
    
    if not like:
        return {"liked": False}
    
    return {
        "liked": True,
        "liked_at": like.liked_at
    }
