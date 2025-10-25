from fastapi import APIRouter, HTTPException, status
from sqlmodel import select

from app.models.post import Post, PostCreate, PostPublic
from app.dependencies import SessionDep, CurrentUser

router = APIRouter(prefix="/posts", tags=["posts"])


@router.post("/", response_model=PostPublic, status_code=status.HTTP_201_CREATED)
def create_post(post_data: PostCreate, session: SessionDep, current_user: CurrentUser):
    post = Post.model_validate(post_data, update={"user_id": current_user.id})
    session.add(post)
    session.commit()
    session.refresh(post)
    return post


@router.get("/{post_id}", response_model=PostPublic)
def read_post(post_id: int, session: SessionDep, current_user: CurrentUser):
    post = session.get(Post, post_id)
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")

    if post.user_id != current_user.id:
        raise HTTPException(
            status_code=403, detail="Not authorized to access this post"
        )

    return post


@router.get("/", response_model=list[PostPublic])
def read_posts(
    session: SessionDep, current_user: CurrentUser, skip: int = 0, limit: int = 20
):
    statement = (
        select(Post).where(Post.user_id == current_user.id).offset(skip).limit(limit)
    )
    posts = session.exec(statement).all()
    return posts
