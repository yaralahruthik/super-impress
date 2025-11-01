from contextlib import asynccontextmanager
from fastapi import FastAPI

from app.database import create_db_and_tables
from app.routers import post


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Startup
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan, root_path="/api")


@app.get("/test")
def read_root():
    return {"message": "This is a response from backend"}


# Include routers
app.include_router(post.router)
