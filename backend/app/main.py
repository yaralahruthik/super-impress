from fastapi import FastAPI

from app.auth.router import auth_router
from app.email_verification.router import email_verification_router
from app.posts.router import posts_router
from app.social.linkedin.router import linkedin_router

app = FastAPI(title="Super Impress")


@app.get("/api/test")
async def root():
    return {"message": "Hello World"}


app.include_router(auth_router, prefix="/api")
app.include_router(email_verification_router, prefix="/api")
app.include_router(linkedin_router, prefix="/api")
app.include_router(posts_router, prefix="/api")
