from contextlib import asynccontextmanager
from fastapi import FastAPI, HTTPException
from sqlmodel import select

from app.database import create_db_and_tables
from app.models.post import Post
from app.dependencies import SessionDep


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Startup
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan)


# Post endpoints
@app.post("/posts/", response_model=Post)
def create_post(post: Post, session: SessionDep):
    session.add(post)
    session.commit()
    session.refresh(post)
    return post


@app.get("/posts/{post_id}", response_model=Post)
def read_post(post_id: int, session: SessionDep):
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
    return post


@app.get("/posts/", response_model=list[Post])
def read_posts(session: SessionDep, skip: int = 0, limit: int = 20):
    statement = select(Post).offset(skip).limit(limit)
    posts = session.exec(statement).all()
    return posts
