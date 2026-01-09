from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.auth.router import auth_router
from app.email_verification.router import email_verification_router
from app.posts.router import posts_router
from app.scheduler import shutdown_scheduler, start_scheduler
from app.social.linkedin.router import linkedin_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager."""
    # Startup
    start_scheduler()
    yield
    # Shutdown
    shutdown_scheduler()


app = FastAPI(title="Super Impress", lifespan=lifespan)


@app.get("/api/test")
async def root():
    return {"message": "Hello World"}


app.include_router(auth_router, prefix="/api")
app.include_router(email_verification_router, prefix="/api")
app.include_router(linkedin_router, prefix="/api")
app.include_router(posts_router, prefix="/api")
