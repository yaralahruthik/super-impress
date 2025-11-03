from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.auth.router import auth_router
from app.database import create_db_and_tables


@asynccontextmanager
async def lifespan(_: FastAPI):
    create_db_and_tables()
    yield


app = FastAPI(title="Super Impress", lifespan=lifespan)

app.include_router(auth_router)
