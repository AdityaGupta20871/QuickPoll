from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Vote(Base):
    __tablename__ = "votes"
    
    id = Column(Integer, primary_key=True, index=True)
    poll_id = Column(Integer, ForeignKey("polls.id"), nullable=False)
    option_id = Column(Integer, ForeignKey("poll_options.id"), nullable=False)
    session_id = Column(String(100), nullable=False, index=True)
    
    voted_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    poll = relationship("Poll", back_populates="votes")
    option = relationship("PollOption", back_populates="votes")
    
    def __repr__(self):
        return f"<Vote(id={self.id}, poll_id={self.poll_id}, option_id={self.option_id})>"
