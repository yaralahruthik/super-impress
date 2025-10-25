from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.database import create_db_and_tables
from app.routers import post, auth
from app.config import settings


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Startup
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan, title="Super Impress API", root_path="/api")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.frontend_url],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(post.router)
