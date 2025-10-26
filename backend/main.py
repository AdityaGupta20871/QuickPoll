from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config import settings
from routers import polls_router, votes_router, likes_router, websocket_router

app = FastAPI(
    title="QuickPoll API",
    description="Real-time polling platform API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(polls_router)
app.include_router(votes_router)
app.include_router(likes_router)
app.include_router(websocket_router)

@app.get("/")
async def root():
    return {
        "message": "QuickPoll API",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
