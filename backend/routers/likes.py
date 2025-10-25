from fastapi import APIRouter, Depends, HTTPException, Response, Request
from sqlalchemy.orm import Session
from database import get_db
from models import Poll, Like
from schemas import LikeResponse, LikeDeleteResponse
from utils.session import get_or_create_session

router = APIRouter(prefix="/api/polls", tags=["likes"])


@router.post("/{poll_id}/like", response_model=LikeResponse, status_code=201)
def like_poll(
    poll_id: int,
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """Like a poll"""
    # Get session ID
    session_id = get_or_create_session(request, response)
    
    # Check if poll exists
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Check if user already liked
    existing_like = db.query(Like).filter(
        Like.poll_id == poll_id,
        Like.session_id == session_id
    ).first()
    
    if existing_like:
        raise HTTPException(
            status_code=400,
            detail="You have already liked this poll"
        )
    
    # Create like
    new_like = Like(
        poll_id=poll_id,
        session_id=session_id
    )
    db.add(new_like)
    db.commit()
    db.refresh(new_like)
    
    return LikeResponse(
        id=new_like.id,
        poll_id=new_like.poll_id,
        liked_at=new_like.liked_at,
        message="Poll liked successfully"
    )


@router.delete("/{poll_id}/like", response_model=LikeDeleteResponse)
def unlike_poll(
    poll_id: int,
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """Remove like from a poll"""
    # Get session ID
    session_id = get_or_create_session(request, response)
    
    # Check if poll exists
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
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
    
    return LikeDeleteResponse(
        message="Like removed successfully",
        poll_id=poll_id
    )


@router.get("/{poll_id}/like")
def get_user_like_status(
    poll_id: int,
    request: Request,
    response: Response,
    db: Session = Depends(get_db)
):
    """Check if user has liked the poll"""
    session_id = get_or_create_session(request, response)
    
    # Check if poll exists
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Check if user liked
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
