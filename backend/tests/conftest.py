from typing import Generator
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

from app.core.database import Base, get_db
from app.core.security import create_access_token
from app.main import app
from app.models.user import User
from app.schemas.user import UserCreate
from app.services.auth_service import auth_service

# Isolated In-Memory SQLite database for automated testing
TEST_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    TEST_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture(scope="function")
def db_session() -> Generator[Session, None, None]:
    """Create fresh database tables before each test and drop them after."""
    Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session: Session) -> Generator[TestClient, None, None]:
    """Provide a TestClient with the get_db dependency overridden to the test database."""
    def override_get_db() -> Generator[Session, None, None]:
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def admin_user(db_session: Session) -> User:
    """Create and persist an active administrator user for tests."""
    user_in = UserCreate(
        username="test_admin",
        email="admin@example.com",
        password="ValidPassword123!",
    )
    return auth_service.create_user(db_session, user_in)


@pytest.fixture(scope="function")
def auth_client(client: TestClient, admin_user: User) -> TestClient:
    """
    Provide an authenticated TestClient with httpOnly session cookie
    and standard CSRF-safe headers (X-Requested-With and matching Origin).
    """
    token = create_access_token(subject=admin_user.id)
    client.cookies.set("portfolio_admin_token", token)
    client.headers.update({
        "X-Requested-With": "XMLHttpRequest",
        "Origin": "http://localhost:5173",
    })
    return client
