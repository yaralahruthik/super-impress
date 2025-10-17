from fastapi import FastAPI

app = FastAPI()


@app.get("/api/test")
def read_root():
    return {"message": "This is a response from backend"}
