from fastapi import FastAPI

from app.auth.router import auth_router

# @asynccontextmanager
# async def lifespan(_: FastAPI):
#     create_db_and_tables()
#     yield


app = FastAPI(title="Super Impress")

app.include_router(auth_router)
