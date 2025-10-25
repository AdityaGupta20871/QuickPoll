from pydantic import BaseModel, Field, field_validator
from typing import List, Optional
from datetime import datetime


class PollOptionBase(BaseModel):
    option_text: str = Field(..., min_length=1, max_length=200, description="Poll option text")


class PollOptionCreate(PollOptionBase):
    pass


class PollOptionResponse(PollOptionBase):
    id: int
    vote_count: int = 0
    
    class Config:
        from_attributes = True


class PollCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=200, description="Poll title")
    description: Optional[str] = Field(None, max_length=1000, description="Poll description")
    options: List[str] = Field(..., min_items=2, max_items=10, description="Poll options")
    
    @field_validator('options')
    @classmethod
    def validate_options(cls, v):
        if len(v) < 2:
            raise ValueError('Poll must have at least 2 options')
        if len(v) > 10:
            raise ValueError('Poll cannot have more than 10 options')
        # Remove empty strings and duplicates
        options = [opt.strip() for opt in v if opt.strip()]
        if len(options) != len(set(options)):
            raise ValueError('Poll options must be unique')
        return options


class PollBase(BaseModel):
    id: int
    title: str
    description: Optional[str] = None
    created_by: str
    created_at: datetime
    
    class Config:
        from_attributes = True


class PollResponse(PollBase):
    """Basic poll response without options"""
    total_votes: int = 0
    total_likes: int = 0


class PollDetail(PollBase):
    """Detailed poll response with options and stats"""
    options: List[PollOptionResponse]
    total_votes: int = 0
    total_likes: int = 0
    user_voted: bool = False
    user_liked: bool = False


class PollListResponse(BaseModel):
    polls: List[PollResponse]
    total: int
    page: int
    page_size: int
