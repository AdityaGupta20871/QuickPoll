from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class Like(Base):
    __tablename__ = "likes"
    
    id = Column(Integer, primary_key=True, index=True)
    poll_id = Column(Integer, ForeignKey("polls.id"), nullable=False)
    
    # Support both authenticated and anonymous users
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=True, index=True)
    session_id = Column(String(100), nullable=True, index=True)  # For anonymous users
    
    liked_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    poll = relationship("Poll", back_populates="likes")
    user = relationship("User", back_populates="likes")
    
    def __repr__(self):
        return f"<Like(id={self.id}, poll_id={self.poll_id})>"
