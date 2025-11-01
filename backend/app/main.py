from contextlib import asynccontextmanager
from fastapi import FastAPI
from starlette.middleware.sessions import SessionMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from app.database import create_db_and_tables
from app.routers import post, auth
from app.config import settings


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Startup
    create_db_and_tables()
    yield


app = FastAPI(lifespan=lifespan, title="Super Impress API", root_path="/api")


@app.get("/test")
def read_root():
    return {"message": "This is a response from backend"}


# required for OAuth
app.add_middleware(
    SessionMiddleware,
    secret_key=settings.secret_key,
)

app.include_router(auth.router, prefix="/api")
app.include_router(post.router, prefix="/api")

BUILD_DIR = "../frontend/build"
app.mount("/_app", StaticFiles(directory=f"{BUILD_DIR}/_app"), name="app_assets")


@app.get("/{full_path:path}")
async def serve_spa(full_path: str):
    from pathlib import Path

    file_path = Path(BUILD_DIR) / full_path

    if file_path.is_file():
        return FileResponse(file_path)

    return FileResponse(f"{BUILD_DIR}/200.html")  # fallback
