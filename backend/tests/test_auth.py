import pytest
from sqlalchemy.orm import Session

from app.core.config import Settings
from app.core.rate_limiter import login_failure_limiter
from app.core.security import verify_password
from app.models.user import User
from app.schemas.user import UserCreate, UserResponse
from app.services.auth_service import auth_service


@pytest.fixture(autouse=True)
def reset_limiters():
    """Ensure in-memory rate limiting state is fresh before and after every test."""
    login_failure_limiter.reset()
    yield
    login_failure_limiter.reset()


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
# SECURITY, BRUTE-FORCE & CSRF TESTS
# ==============================================================================

def test_password_never_stored_plaintext(test_admin_user: User) -> None:
    """Verify password is encrypted using bcrypt and not stored as plaintext."""
    assert test_admin_user.hashed_password != "SuperSecretPassword123!"
    assert test_admin_user.hashed_password.startswith("$2b$")
    assert verify_password("SuperSecretPassword123!", test_admin_user.hashed_password)


def test_login_brute_force_lockout_after_five_failed_attempts(client, test_admin_user: User) -> None:
    """
    Verify login brute-force protection:
    - First 5 failed attempts return HTTP 401.
    - 6th failed attempt returns HTTP 429 Too Many Requests.
    """
    for attempt in range(1, 6):
        res = client.post(
            "/api/v1/auth/login",
            json={"username": "admin_tester", "password": f"BadPassword{attempt}"},
        )
        assert res.status_code == 401, f"Attempt {attempt} expected 401, got {res.status_code}"
        assert "Invalid username or password" in res.json()["detail"]

    # 6th attempt should be blocked with 429
    blocked_res = client.post(
        "/api/v1/auth/login",
        json={"username": "admin_tester", "password": "BadPassword6"},
    )
    assert blocked_res.status_code == 429
    assert "Too many failed login attempts" in blocked_res.json()["detail"]


def test_login_brute_force_reset_on_successful_authentication(client, test_admin_user: User) -> None:
    """Verify successful authentication resets the failure counter."""
    # 4 invalid attempts
    for attempt in range(1, 5):
        res = client.post(
            "/api/v1/auth/login",
            json={"username": "admin_tester", "password": f"BadPassword{attempt}"},
        )
        assert res.status_code == 401

    # 5th attempt is valid -> succeeds and resets failure count
    success_res = client.post(
        "/api/v1/auth/login",
        json={"username": "admin_tester", "password": "SuperSecretPassword123!"},
    )
    assert success_res.status_code == 200

    # An invalid attempt afterwards should be treated as attempt 1 (401, not 429)
    res_after = client.post(
        "/api/v1/auth/login",
        json={"username": "admin_tester", "password": "AnotherBadPassword"},
    )
    assert res_after.status_code == 401


def test_login_brute_force_independent_tracking_for_different_identifiers(client, test_admin_user: User) -> None:
    """Verify failure state for one account does not block a different account."""
    # 5 failed attempts for target_user
    for attempt in range(1, 6):
        res = client.post(
            "/api/v1/auth/login",
            json={"username": "target_user", "password": "WrongPassword"},
        )
        assert res.status_code == 401

    # target_user is now locked out
    blocked_res = client.post(
        "/api/v1/auth/login",
        json={"username": "target_user", "password": "WrongPassword"},
    )
    assert blocked_res.status_code == 429

    # Valid login for admin_tester is NOT blocked
    valid_res = client.post(
        "/api/v1/auth/login",
        json={"username": "admin_tester", "password": "SuperSecretPassword123!"},
    )
    assert valid_res.status_code == 200


def test_csrf_protection_for_cookie_requests(client, test_admin_user: User) -> None:
    """
    Verify state-changing admin requests authenticated via cookies require BOTH:
    1. A trusted Origin or Referer.
    2. A custom header (e.g. X-Requested-With or X-CSRF-Token).
    """
    # 1. Log in to establish authentication cookie
    login_res = client.post(
        "/api/v1/auth/login",
        json={"username": "admin_tester", "password": "SuperSecretPassword123!"},
    )
    assert login_res.status_code == 200

    project_payload = {
        "title": "CSRF Target",
        "slug": "csrf-target",
        "short_description": "Desc",
        "description": "Full detailed description of project.",
        "technologies": ["Python"],
    }

    # 2. Reject untrusted cross-origin
    untrusted_res = client.post(
        "/api/v1/admin/projects",
        json=project_payload,
        headers={
            "Origin": "https://evil-attacker.com",
            "X-Requested-With": "XMLHttpRequest",
        },
    )
    assert untrusted_res.status_code == 403
    assert "CSRF validation failed" in untrusted_res.json()["detail"]

    # 3. Reject missing Origin and Referer
    missing_origin_res = client.post(
        "/api/v1/admin/projects",
        json=project_payload,
        headers={"X-Requested-With": "XMLHttpRequest"},
    )
    assert missing_origin_res.status_code == 403
    assert "missing Origin or Referer" in missing_origin_res.json()["detail"]

    # 4. Reject valid Origin without custom CSRF header
    missing_header_res = client.post(
        "/api/v1/admin/projects",
        json=project_payload,
        headers={"Origin": "http://localhost:5173"},
    )
    assert missing_header_res.status_code == 403
    assert "CSRF validation failed" in missing_header_res.json()["detail"]

    # 5. Allow valid Origin AND custom header (X-Requested-With)
    valid_res = client.post(
        "/api/v1/admin/projects",
        json=project_payload,
        headers={
            "Origin": "http://localhost:5173",
            "X-Requested-With": "XMLHttpRequest",
        },
    )
    assert valid_res.status_code == 201
    proj_id = valid_res.json()["id"]

    # 6. Allow valid Origin AND alternate custom header (X-CSRF-Token) on PATCH
    valid_patch_res = client.patch(
        f"/api/v1/admin/projects/{proj_id}",
        json={"title": "Updated via Valid CSRF Header"},
        headers={
            "Origin": "http://localhost:5173",
            "X-CSRF-Token": "test-csrf-token",
        },
    )
    assert valid_patch_res.status_code == 200
    assert valid_patch_res.json()["title"] == "Updated via Valid CSRF Header"


# ==============================================================================
# PRODUCTION ENVIRONMENT CONFIGURATION TESTS
# ==============================================================================

def test_production_environment_rejects_insecure_secret_key() -> None:
    """Verify that Settings raises ValueError if ENVIRONMENT=production with default secret."""
    with pytest.raises(ValueError) as exc:
        Settings(
            ENVIRONMENT="production",
            COOKIE_SECURE=True,
            SECRET_KEY="insecure-dev-secret-key-change-in-production",
        )
    assert "CRITICAL SECURITY ERROR" in str(exc.value)


def test_production_environment_rejects_insecure_cookie() -> None:
    """Verify that Settings raises ValueError if ENVIRONMENT=production and COOKIE_SECURE=False."""
    with pytest.raises(ValueError) as exc:
        Settings(
            ENVIRONMENT="production",
            COOKIE_SECURE=False,
            SECRET_KEY="super-secure-production-key-at-least-32-chars-long",
        )
    assert "COOKIE_SECURE must be True in production" in str(exc.value)


def test_production_environment_rejects_short_secret_key() -> None:
    """Verify that Settings raises ValueError if SECRET_KEY is shorter than 32 characters in production."""
    with pytest.raises(ValueError) as exc:
        Settings(
            ENVIRONMENT="production",
            COOKIE_SECURE=True,
            SECRET_KEY="short-key-12345",
        )
    assert "must be at least 32 characters" in str(exc.value)


def test_production_environment_rejects_placeholder_secret() -> None:
    """Verify that Settings raises ValueError if SECRET_KEY contains known placeholder words in production."""
    with pytest.raises(ValueError) as exc:
        Settings(
            ENVIRONMENT="production",
            COOKIE_SECURE=True,
            SECRET_KEY="placeholder-production-key-longer-than-32-chars-value",
        )
    assert "CRITICAL SECURITY ERROR" in str(exc.value)


def test_production_environment_rejects_wildcard_cors() -> None:
    """Verify that Settings raises ValueError if BACKEND_CORS_ORIGINS contains '*' in production."""
    with pytest.raises(ValueError) as exc:
        Settings(
            ENVIRONMENT="production",
            COOKIE_SECURE=True,
            SECRET_KEY="super-secure-production-key-at-least-32-chars-long",
            BACKEND_CORS_ORIGINS=["*"],
        )
    assert "Wildcard '*' origin is strictly forbidden" in str(exc.value)


def test_production_environment_accepts_valid_config() -> None:
    """Verify that valid production settings pass validation without raising errors."""
    valid_settings = Settings(
        ENVIRONMENT="production",
        COOKIE_SECURE=True,
        SECRET_KEY="super-secure-production-key-at-least-32-chars-long",
        BACKEND_CORS_ORIGINS=["https://my-actual-portfolio.com"],
    )
    assert valid_settings.ENVIRONMENT == "production"
    assert valid_settings.COOKIE_SECURE is True
    assert valid_settings.BACKEND_CORS_ORIGINS == ["https://my-actual-portfolio.com"]

