from fastapi import APIRouter, Depends, HTTPException, Response, Request, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from models import Poll, Like, User
from schemas import LikeResponse, LikeDeleteResponse
from utils.auth import get_current_active_user
from websocket.connection_manager import manager

router = APIRouter(prefix="/api/polls", tags=["likes"])


@router.post("/{poll_id}/like", response_model=LikeResponse, status_code=201)
async def like_poll(
    poll_id: int,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Like a poll (requires authentication)"""
    # Check if poll exists
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Check if user already liked
    existing_like = db.query(Like).filter(
        Like.poll_id == poll_id,
        Like.user_id == current_user.id
    ).first()
    
    if existing_like:
        raise HTTPException(
            status_code=400,
            detail="You have already liked this poll"
        )
    
    # Create like linked to authenticated user
    new_like = Like(
        poll_id=poll_id,
        user_id=current_user.id
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
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Remove like from a poll (requires authentication)"""
    # Check if poll exists
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Find existing like
    existing_like = db.query(Like).filter(
        Like.poll_id == poll_id,
        Like.user_id == current_user.id
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
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Check if user has liked the poll (requires authentication)"""
    # Check if poll exists
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Check if user liked
    like = db.query(Like).filter(
        Like.poll_id == poll_id,
        Like.user_id == current_user.id
    ).first()
    
    if not like:
        return {"liked": False}
    
    return {
        "liked": True,
        "liked_at": like.liked_at
    }
