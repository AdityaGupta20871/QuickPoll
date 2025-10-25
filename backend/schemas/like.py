from pydantic import BaseModel
from datetime import datetime


class LikeCreate(BaseModel):
    """Schema for creating a like (no fields needed, poll_id comes from URL)"""
    pass


class LikeResponse(BaseModel):
    id: int
    poll_id: int
    liked_at: datetime
    message: str = "Poll liked successfully"
    
    class Config:
        from_attributes = True


class LikeDeleteResponse(BaseModel):
    message: str = "Like removed successfully"
    poll_id: int
