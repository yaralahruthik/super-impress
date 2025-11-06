from fastapi import FastAPI

from app.auth.router import auth_router

app = FastAPI(title="Super Impress")


@app.get("/api/test")
async def root():
    return {"message": "Hello World"}


app.include_router(auth_router, prefix="/api")
