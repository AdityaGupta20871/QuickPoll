from fastapi import APIRouter, Depends, HTTPException, Response, Request, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from models import Poll, PollOption, Vote, User
from schemas import VoteCreate, VoteResponse
from utils.auth import get_current_active_user
from websocket.connection_manager import manager

router = APIRouter(prefix="/api/polls", tags=["votes"])


@router.post("/{poll_id}/vote", response_model=VoteResponse, status_code=201)
async def submit_vote(
    poll_id: int,
    vote_data: VoteCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Submit a vote for a poll option (requires authentication)"""
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
    
    # Check if user already voted
    existing_vote = db.query(Vote).filter(
        Vote.poll_id == poll_id,
        Vote.user_id == current_user.id
    ).first()
    
    if existing_vote:
        raise HTTPException(
            status_code=400,
            detail="You have already voted on this poll"
        )
    
    # Create vote linked to authenticated user
    new_vote = Vote(
        poll_id=poll_id,
        option_id=vote_data.option_id,
        user_id=current_user.id
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
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Check if user has voted and get their vote (requires authentication)"""
    # Check if poll exists
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Get user's vote
    vote = db.query(Vote).filter(
        Vote.poll_id == poll_id,
        Vote.user_id == current_user.id
    ).first()
    
    if not vote:
        return {"voted": False, "option_id": None}
    
    return {
        "voted": True,
        "option_id": vote.option_id,
        "voted_at": vote.voted_at
    }
