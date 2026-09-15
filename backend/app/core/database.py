from typing import Generator
from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker, Session
from app.core.config import settings

# Normalize postgres:// to postgresql:// for compatibility with hosted databases (e.g. Render, Heroku)
database_url = settings.DATABASE_URL
if database_url.startswith("postgres://"):
    database_url = database_url.replace("postgres://", "postgresql://", 1)

# SQLAlchemy 2.x Engine
# pool_pre_ping=True verifies connections before handing them out, preventing stale socket errors
engine = create_engine(
    database_url,
    pool_pre_ping=True,
)

# Thread-local session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """
    SQLAlchemy 2.x Declarative Base.
    All database models will inherit from this class.
    """
    pass


def get_db() -> Generator[Session, None, None]:
    """
    FastAPI dependency that provides a transactional database session per request.
    Ensures the session is always closed after the request completes.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
