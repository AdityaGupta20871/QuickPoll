from fastapi import APIRouter, Depends, HTTPException, Response, Request, BackgroundTasks, Cookie
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timedelta
from slowapi import Limiter
from slowapi.util import get_remote_address
from database import get_db
from models import Poll, PollOption, Vote, Like
from schemas import PollCreate, PollUpdate, PollResponse, PollDetail, PollListResponse
from websocket.connection_manager import manager
import uuid

router = APIRouter(prefix="/api/polls", tags=["polls"])
limiter = Limiter(key_func=get_remote_address)


@router.post("/", response_model=PollDetail, status_code=201)
@limiter.limit("5/minute")  # Limit poll creation to prevent spam
async def create_poll(
    request: Request,
    poll_data: PollCreate,
    response: Response,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    session_id: Optional[str] = Cookie(default=None)
):
    """Create a new poll with options"""
    # Generate or use existing session ID
    if not session_id:
        session_id = str(uuid.uuid4())
        response.set_cookie(key="session_id", value=session_id, httponly=True, max_age=31536000)
    
    # Calculate expiry if duration provided
    expires_at = None
    if poll_data.duration_hours:
        expires_at = datetime.utcnow() + timedelta(hours=poll_data.duration_hours)
    
    # Create poll with owner tracking
    new_poll = Poll(
        title=poll_data.title,
        description=poll_data.description,
        created_by="anonymous",
        owner_session_id=session_id,
        expires_at=expires_at
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
        expires_at=new_poll.expires_at,
        is_active=new_poll.is_active,
        options=[
            {"id": opt.id, "option_text": opt.option_text, "vote_count": 0}
            for opt in new_poll.options
        ],
        total_votes=0,
        total_likes=0,
        user_voted=False,
        user_liked=False,
        is_owner=True,
        is_expired=False
    )
    
    # Broadcast new poll to all connected clients
    background_tasks.add_task(
        manager.broadcast_poll_created,
        poll_response.model_dump()
    )
    
    return poll_response


@router.get("/", response_model=PollListResponse)
@limiter.limit("30/minute")  # More lenient for viewing polls
def list_polls(
    request: Request,
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
@limiter.limit("30/minute")  # More lenient for viewing individual polls
def get_poll(
    request: Request,
    poll_id: int,
    db: Session = Depends(get_db),
    session_id: Optional[str] = Cookie(default=None)
):
    """Get detailed poll information including options"""
    # Get poll
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Calculate totals
    total_votes = sum(opt.vote_count for opt in poll.options)
    total_likes = len(poll.likes)
    
    # Check ownership
    is_owner = session_id and poll.owner_session_id == session_id
    
    # Check if expired
    is_expired = poll.expires_at and datetime.utcnow() > poll.expires_at
    
    # Build response
    return PollDetail(
        id=poll.id,
        title=poll.title,
        description=poll.description,
        created_by=poll.created_by,
        created_at=poll.created_at,
        expires_at=poll.expires_at,
        is_active=poll.is_active,
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
        user_voted=False,
        user_liked=False,
        is_owner=is_owner,
        is_expired=is_expired
    )


@router.put("/{poll_id}", response_model=PollDetail)
@limiter.limit("10/minute")
def update_poll(
    request: Request,
    poll_id: int,
    poll_update: PollUpdate,
    db: Session = Depends(get_db),
    session_id: Optional[str] = Cookie(default=None)
):
    """Update poll (title, description, or close it). Only owner can update."""
    # Get poll
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Check ownership
    if not session_id or poll.owner_session_id != session_id:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to edit this poll"
        )
    
    # Update fields
    if poll_update.title is not None:
        poll.title = poll_update.title
    if poll_update.description is not None:
        poll.description = poll_update.description
    if poll_update.is_active is not None:
        poll.is_active = poll_update.is_active
    
    poll.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(poll)
    
    # Calculate totals
    total_votes = sum(opt.vote_count for opt in poll.options)
    total_likes = len(poll.likes)
    is_expired = poll.expires_at and datetime.utcnow() > poll.expires_at
    
    return PollDetail(
        id=poll.id,
        title=poll.title,
        description=poll.description,
        created_by=poll.created_by,
        created_at=poll.created_at,
        expires_at=poll.expires_at,
        is_active=poll.is_active,
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
        user_voted=False,
        user_liked=False,
        is_owner=True,
        is_expired=is_expired
    )


@router.delete("/{poll_id}", status_code=204)
@limiter.limit("5/minute")
def delete_poll(
    request: Request,
    poll_id: int,
    db: Session = Depends(get_db),
    session_id: Optional[str] = Cookie(default=None)
):
    """Delete a poll. Only owner can delete."""
    # Get poll
    poll = db.query(Poll).filter(Poll.id == poll_id).first()
    if not poll:
        raise HTTPException(status_code=404, detail="Poll not found")
    
    # Check ownership
    if not session_id or poll.owner_session_id != session_id:
        raise HTTPException(
            status_code=403,
            detail="You don't have permission to delete this poll"
        )
    
    # Delete poll (cascade will delete options, votes, likes)
    db.delete(poll)
    db.commit()
    
    return Response(status_code=204)
