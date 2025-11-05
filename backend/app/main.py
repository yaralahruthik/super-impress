from fastapi import FastAPI

from app.auth.router import auth_router

app = FastAPI(title="Super Impress")

app.include_router(auth_router)
