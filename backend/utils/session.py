import uuid
from fastapi import Request, Response


def get_or_create_session(request: Request, response: Response) -> str:
    """
    Get existing session ID from cookie or create a new one.
    Session ID is used to track user votes and likes without authentication.
    """
    session_id = request.cookies.get("session_id")
    
    if not session_id:
        # Generate new session ID
        session_id = str(uuid.uuid4())
        # Set cookie that expires in 30 days
        response.set_cookie(
            key="session_id",
            value=session_id,
            max_age=30 * 24 * 60 * 60,  # 30 days
            httponly=True,
            samesite="lax"
        )
    
    return session_id
