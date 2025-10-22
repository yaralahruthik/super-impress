from sqlmodel import Session, SQLModel, create_engine
from .config import settings

engine = create_engine(settings.db_url)


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)


def get_session():
    with Session(engine) as session:
        yield session
