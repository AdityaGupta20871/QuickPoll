from fastapi import APIRouter, Depends, HTTPException, Response, Request, BackgroundTasks
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from models import Poll, PollOption, Vote, Like, User
from schemas import PollCreate, PollResponse, PollDetail, PollListResponse
from utils.auth import get_current_active_user
from websocket.connection_manager import manager

router = APIRouter(prefix="/api/polls", tags=["polls"])


@router.post("/", response_model=PollDetail, status_code=201)
async def create_poll(
    poll_data: PollCreate,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Create a new poll with options (requires authentication)"""
    # Create poll linked to authenticated user
    new_poll = Poll(
        title=poll_data.title,
        description=poll_data.description,
        user_id=current_user.id,
        created_by=current_user.email  # For display
    )
    db.add(new_poll)
    db.flush()  # Get poll ID without committing
    
    # Create poll options
    for option_text in poll_data.options:
        poll_option = PollOption(
            poll_id=new_poll.id,
            option_text=option_text
        )
        db.add(poll_option)
    
    db.commit()
    db.refresh(new_poll)
    
    # Build response
    poll_response = PollDetail(
        id=new_poll.id,
        title=new_poll.title,
        description=new_poll.description,
        created_by=new_poll.created_by,
        created_at=new_poll.created_at,
        options=[
            {"id": opt.id, "option_text": opt.option_text, "vote_count": 0}
            for opt in new_poll.options
        ],
        total_votes=0,
        total_likes=0,
        user_voted=False,
        user_liked=False
    )
    
    # Broadcast new poll to all connected clients
    background_tasks.add_task(
        manager.broadcast_poll_created,
        poll_response.model_dump()
    )
    
    return poll_response


@router.get("/", response_model=PollListResponse)
def list_polls(
    page: int = 1,
    page_size: int = 10,
    db: Session = Depends(get_db)
):
    """Get list of all polls with pagination"""
    if page < 1:
        page = 1
    if page_size < 1 or page_size > 100:
        page_size = 10
    
    skip = (page - 1) * page_size
    
    # Get total count
    total = db.query(Poll).count()
    
    # Get polls with pagination
    polls = db.query(Poll).order_by(Poll.created_at.desc()).offset(skip).limit(page_size).all()
    
    # Build response
    poll_responses = []
    for poll in polls:
        total_votes = sum(opt.vote_count for opt in poll.options)
        total_likes = len(poll.likes)
        
        poll_responses.append(PollResponse(
            id=poll.id,
            title=poll.title,
            description=poll.description,
            created_by=poll.created_by,
            created_at=poll.created_at,
            total_votes=total_votes,
            total_likes=total_likes
        ))
    
    return PollListResponse(
        polls=poll_responses,
        total=total,
        page=page,
        page_size=page_size
    )


@router.get("/{poll_id}", response_model=PollDetail)
def get_poll(
    poll_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    """Get detailed poll information including options and user's vote/like status (requires authentication)"""
    # Get poll
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Check if user voted
    user_vote = db.query(Vote).filter(
        Vote.poll_id == poll_id,
        Vote.user_id == current_user.id
    ).first()
    
    # Check if user liked
    user_like = db.query(Like).filter(
        Like.poll_id == poll_id,
        Like.user_id == current_user.id
    ).first()
    
    # Calculate totals
    total_votes = sum(opt.vote_count for opt in poll.options)
    total_likes = len(poll.likes)
    
    # Build response
    return PollDetail(
        id=poll.id,
        title=poll.title,
        description=poll.description,
        created_by=poll.created_by,
        created_at=poll.created_at,
        options=[
            {
                "id": opt.id,
                "option_text": opt.option_text,
                "vote_count": opt.vote_count
            }
            for opt in poll.options
        ],
        total_votes=total_votes,
        total_likes=total_likes,
        user_voted=user_vote is not None,
        user_liked=user_like is not None
    )
