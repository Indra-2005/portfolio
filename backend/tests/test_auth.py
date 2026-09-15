import pytest
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.core.security import verify_password
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.services.auth_service import auth_service


@pytest.fixture
def test_admin_user(db_session: Session) -> User:
    """Create a persistent active admin user in the test database."""
    user_in = UserCreate(
        username="admin_tester",
        email="admin@example.com",
        password="SuperSecretPassword123!",
    )
    return auth_service.create_user(db_session, user_in)


# ==============================================================================
# AUTHENTICATION ENDPOINT TESTS
# ==============================================================================

def test_login_success_sets_httponly_cookie(client, test_admin_user: User) -> None:
    """Verify successful login sets an httpOnly session cookie and returns user data."""
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "admin_tester", "password": "SuperSecretPassword123!"},
    )
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_admin_user.id
    assert data["username"] == "admin_tester"
    assert data["email"] == "admin@example.com"
    assert "hashed_password" not in data  # Never expose hash

    # Verify cookie presence and attributes
    cookie_header = response.headers.get("set-cookie", "")
    assert "portfolio_admin_token=" in cookie_header
    assert "HttpOnly" in cookie_header.title() or "httponly" in cookie_header.lower()


def test_login_with_email_success(client, test_admin_user: User) -> None:
    """Verify administrator can also log in using their email address."""
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "admin@example.com", "password": "SuperSecretPassword123!"},
    )
    assert response.status_code == 200
    assert response.json()["username"] == "admin_tester"


def test_login_invalid_password_returns_401(client, test_admin_user: User) -> None:
    """Verify incorrect password returns generic 401 without leaking existence."""
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "admin_tester", "password": "WrongPassword999!"},
    )
    assert response.status_code == 401
    assert "Invalid username or password" in response.json()["detail"]


def test_login_nonexistent_user_returns_401(client) -> None:
    """Verify nonexistent user returns generic 401 message."""
    response = client.post(
        "/api/v1/auth/login",
        json={"username": "ghost_user", "password": "Password123!"},
    )
    assert response.status_code == 401
    assert "Invalid username or password" in response.json()["detail"]


def test_login_inactive_user_returns_403(client, db_session: Session) -> None:
    """Verify disabled account cannot authenticate."""
    user = auth_service.create_user(
        db_session,
        UserCreate(username="inactive_admin", email="inactive@example.com", password="Password123!"),
    )
    user.is_active = False
    db_session.commit()

    response = client.post(
        "/api/v1/auth/login",
        json={"username": "inactive_admin", "password": "Password123!"},
    )
    assert response.status_code == 403
    assert "inactive" in response.json()["detail"].lower()


def test_me_unauthenticated_returns_401(client) -> None:
    """Verify GET /api/v1/auth/me returns 401 when no credentials are provided."""
    response = client.get("/api/v1/auth/me")
    assert response.status_code == 401


def test_me_authenticated_via_cookie(client, test_admin_user: User) -> None:
    """Verify GET /api/v1/auth/me succeeds with session cookie."""
    # 1. Login to establish cookie in client session
    login_res = client.post(
        "/api/v1/auth/login",
        json={"username": "admin_tester", "password": "SuperSecretPassword123!"},
    )
    assert login_res.status_code == 200

    # 2. Call /me with preserved cookie
    me_res = client.get("/api/v1/auth/me")
    assert me_res.status_code == 200
    data = me_res.json()
    assert data["username"] == "admin_tester"
    assert data["id"] == test_admin_user.id


def test_logout_clears_cookie(client, test_admin_user: User) -> None:
    """Verify logout invalidates the session and deletes the cookie."""
    client.post(
        "/api/v1/auth/login",
        json={"username": "admin_tester", "password": "SuperSecretPassword123!"},
    )
    assert client.get("/api/v1/auth/me").status_code == 200

    logout_res = client.post("/api/v1/auth/logout")
    assert logout_res.status_code == 200

    # After logout, /me should return 401
    assert client.get("/api/v1/auth/me").status_code == 401


# ==============================================================================
# SECURITY & CSRF TESTS
# ==============================================================================

def test_password_never_stored_plaintext(test_admin_user: User) -> None:
    """Verify password is encrypted using bcrypt and not stored as plaintext."""
    assert test_admin_user.hashed_password != "SuperSecretPassword123!"
    assert test_admin_user.hashed_password.startswith("$2b$")
    assert verify_password("SuperSecretPassword123!", test_admin_user.hashed_password)


def test_csrf_protection_for_cookie_requests(client, test_admin_user: User) -> None:
    """
    Verify state-changing admin requests authenticated via cookies require
    either matching Origin or custom header (e.g. X-Requested-With).
    """
    # 1. Log in
    client.post(
        "/api/v1/auth/login",
        json={"username": "admin_tester", "password": "SuperSecretPassword123!"},
    )

    project_payload = {
        "title": "CSRF Target",
        "slug": "csrf-target",
        "short_description": "Desc",
        "description": "Full desc",
        "technologies": ["Python"],
    }

    # 2. State-changing POST with cookie but UNTRUSTED cross-origin and NO custom header
    forged_response = client.post(
        "/api/v1/admin/projects",
        json=project_payload,
        headers={"Origin": "https://evil-attacker.com"},
    )
    assert forged_response.status_code == 403
    assert "CSRF validation failed" in forged_response.json()["detail"]

    # 3. State-changing POST with cookie AND valid Origin
    valid_origin_res = client.post(
        "/api/v1/admin/projects",
        json=project_payload,
        headers={"Origin": "http://localhost:5173"},
    )
    assert valid_origin_res.status_code == 201

    # 4. State-changing PATCH with custom header (X-Requested-With)
    proj_id = valid_origin_res.json()["id"]
    valid_header_res = client.patch(
        f"/api/v1/admin/projects/{proj_id}",
        json={"title": "Updated via Custom Header"},
        headers={"X-Requested-With": "XMLHttpRequest"},
    )
    assert valid_header_res.status_code == 200
    assert valid_header_res.json()["title"] == "Updated via Custom Header"


def test_production_environment_rejects_insecure_secret_key() -> None:
    """Verify that Settings raises a validation error if ENVIRONMENT=production with default secret."""
    with pytest.raises(ValueError) as exc:
        Settings(
            ENVIRONMENT="production",
            SECRET_KEY="insecure-dev-secret-key-change-in-production",
        )
    assert "CRITICAL SECURITY ERROR" in str(exc.value)
