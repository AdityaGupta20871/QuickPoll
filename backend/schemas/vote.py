from pydantic import BaseModel, Field
from datetime import datetime


class VoteCreate(BaseModel):
    option_id: int = Field(..., description="ID of the poll option to vote for")


class VoteResponse(BaseModel):
    id: int
    poll_id: int
    option_id: int
    voted_at: datetime
    message: str = "Vote recorded successfully"
    
    class Config:
        from_attributes = True
