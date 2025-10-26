from fastapi import APIRouter, Depends, HTTPException, Response, Request, BackgroundTasks, Cookie
from sqlalchemy.orm import Session
from typing import Optional
from database import get_db
from models import Poll, PollOption, Vote
from schemas import VoteCreate, VoteResponse
from websocket.connection_manager import manager
import uuid

router = APIRouter(prefix="/api/polls", tags=["votes"])


@router.post("/{poll_id}/vote", response_model=VoteResponse, status_code=201)
async def submit_vote(
    poll_id: int,
    vote_data: VoteCreate,
    background_tasks: BackgroundTasks,
    response: Response,
    db: Session = Depends(get_db),
    session_id: Optional[str] = Cookie(default=None)
):
    """Submit a vote for a poll option using session-based tracking"""
    # Generate or use existing session ID
    if not session_id:
        session_id = str(uuid.uuid4())
        response.set_cookie(key="session_id", value=session_id, httponly=True, max_age=31536000)  # 1 year
    
    # Check if poll exists
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Check if option exists and belongs to this poll
    option = db.query(PollOption).filter(
        PollOption.id == vote_data.option_id,
        PollOption.poll_id == poll_id
    ).first()
    if not option:
        raise HTTPException(
            status_code=404,
            detail="Poll option not found or does not belong to this poll"
        )
    
    # Check if session already voted
    existing_vote = db.query(Vote).filter(
        Vote.poll_id == poll_id,
        Vote.session_id == session_id
    ).first()
    
    if existing_vote:
        raise HTTPException(
            status_code=400,
            detail="You have already voted on this poll"
        )
    
    # Create vote with session ID
    new_vote = Vote(
        poll_id=poll_id,
        option_id=vote_data.option_id,
        session_id=session_id
    )
    db.add(new_vote)
    
    # Increment vote count for the option
    option.vote_count += 1
    
    db.commit()
    db.refresh(new_vote)
    
    # Calculate total votes for the poll
    total_votes = sum(opt.vote_count for opt in poll.options)
    
    # Broadcast vote update to all connected clients
    background_tasks.add_task(
        manager.broadcast_vote_update,
        poll_id=poll_id,
        option_id=vote_data.option_id,
        vote_count=option.vote_count,
        total_votes=total_votes
    )
    
    return VoteResponse(
        id=new_vote.id,
        poll_id=new_vote.poll_id,
        option_id=new_vote.option_id,
        voted_at=new_vote.voted_at,
        message="Vote recorded successfully"
    )


@router.get("/{poll_id}/vote")
def get_user_vote(
    poll_id: int,
    db: Session = Depends(get_db),
    session_id: Optional[str] = Cookie(default=None)
):
    """Check if session has voted and get their vote"""
    # Check if poll exists
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    if not session_id:
        return {"voted": False, "option_id": None}
    
    # Get session's vote
    vote = db.query(Vote).filter(
        Vote.poll_id == poll_id,
        Vote.session_id == session_id
    ).first()
    
    if not vote:
        return {"voted": False, "option_id": None}
    
    return {
        "voted": True,
        "option_id": vote.option_id,
        "voted_at": vote.voted_at
    }
