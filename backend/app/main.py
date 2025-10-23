from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.database import create_db_and_tables
from app.routers import post, auth


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Startup
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan, title="Super Impress API")

# Include routers
app.include_router(auth.router)
app.include_router(post.router)
