import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from sqlalchemy import select, func

from app.core.rate_limiter import login_failure_limiter
from app.models.contact_message import ContactMessage
from app.models.project import Project
from app.models.user import User
from app.schemas.project import ProjectCreate
from app.services.project_service import project_service


@pytest.fixture(autouse=True)
def reset_limiters():
    login_failure_limiter.reset()
    yield
    login_failure_limiter.reset()


@pytest.fixture
def sample_published_project(db_session: Session) -> Project:
    """Seed a sample published project for testing."""
    proj = project_service.create_project(
        db_session,
        ProjectCreate(
            title="Safe Project",
            slug="safe-project",
            short_description="Safe description",
            description="Detailed content about safe project.",
            technologies=["Python", "FastAPI"],
            category="Backend",
            published=True,
            featured=True,
        ),
    )
    return proj


@pytest.fixture
def sample_unpublished_project(db_session: Session) -> Project:
    """Seed a sample draft/unpublished project for testing."""
    proj = project_service.create_project(
        db_session,
        ProjectCreate(
            title="Draft Project",
            slug="draft-project",
            short_description="Draft description",
            description="Detailed content about draft project.",
            technologies=["Python"],
            category="Internal",
            published=False,
            featured=False,
        ),
    )
    return proj


# ==============================================================================
# TASK 5 — SQL INJECTION TESTS
# ==============================================================================

@pytest.mark.parametrize(
    "payload",
    [
        "' OR '1'='1",
        "' OR 1=1 --",
        "'; DROP TABLE projects; --",
        "\" UNION SELECT \"",
        "safe-project' OR '1'='1",
        "nonexistent' UNION SELECT id, title FROM projects --",
    ],
)
def test_sql_injection_in_public_slug_lookup(
    client: TestClient, db_session: Session, sample_published_project: Project, payload: str
) -> None:
    """
    Verify malicious SQL strings in the URL slug are treated as literal strings,
    not executed as SQL syntax. Tables must remain intact and unauthorized records
    must not be leaked.
    """
    res = client.get(f"/api/v1/projects/{payload}")
    assert res.status_code == 404
    assert "was not found" in res.json()["detail"]

    # Verify database table is completely intact
    count = db_session.scalar(select(func.count(Project.id)))
    assert count >= 1


@pytest.mark.parametrize(
    "payload",
    [
        "' OR '1'='1",
        "' OR 1=1 --",
        "'; DROP TABLE projects; --",
        "\" UNION SELECT 1, 2, 3 --",
    ],
)
def test_sql_injection_in_project_category_filter(
    client: TestClient,
    db_session: Session,
    sample_published_project: Project,
    sample_unpublished_project: Project,
    payload: str,
) -> None:
    """
    Verify that SQL injection payloads in query filters (such as category)
    are safely parameterized and do not expose draft/unpublished projects or drop tables.
    """
    res = client.get(f"/api/v1/projects?category={payload}")
    assert res.status_code == 200
    data = res.json()
    # The payload will not match the literal category 'Backend'
    assert data["total"] == 0
    assert len(data["items"]) == 0

    # Ensure unpublished projects were not leaked
    for item in data["items"]:
        assert item["published"] is True

    # Verify table integrity
    count = db_session.scalar(select(func.count(Project.id)))
    assert count >= 2


@pytest.mark.parametrize(
    "username_payload, password_payload",
    [
        ("' OR '1'='1", "' OR '1'='1"),
        ("admin' --", "anything"),
        ("' OR 1=1 --", "password"),
        ("'; DROP TABLE users; --", "pass"),
        ("\" UNION SELECT 1, 'admin', 'hash' --", "pass"),
    ],
)
def test_sql_injection_in_auth_login(
    client: TestClient, db_session: Session, admin_user: User, username_payload: str, password_payload: str
) -> None:
    """
    Verify SQL injection payloads in login credentials are treated strictly as data.
    Must return HTTP 401 without bypassing authentication.
    """
    res = client.post(
        "/api/v1/auth/login",
        json={"username": username_payload, "password": password_payload},
    )
    assert res.status_code == 401
    assert "Invalid username or password" in res.json()["detail"]

    # Verify users table is intact
    user_count = db_session.scalar(select(func.count(User.id)))
    assert user_count >= 1


def test_sql_injection_in_contact_message_submission(
    client: TestClient, db_session: Session
) -> None:
    """
    Verify SQL injection payloads in contact form submission are stored as literal text
    and do not alter table structures.
    """
    payload = {
        "name": "Attacker'; DROP TABLE contact_messages; --",
        "email": "attacker@example.com",
        "subject": "' OR '1'='1",
        "message": "Testing SQL injection: '; DROP TABLE projects; -- and UNION SELECT 1,2,3;",
    }
    res = client.post("/api/v1/contact", json=payload)
    assert res.status_code == 201
    assert res.json()["status"] == "ok"

    # Verify contact_messages table is intact and stored the literal string
    stmt = select(ContactMessage).where(ContactMessage.email == "attacker@example.com")
    msg = db_session.scalars(stmt).first()
    assert msg is not None
    assert msg.name == "Attacker'; DROP TABLE contact_messages; --"
    assert msg.subject == "' OR '1'='1"

    # Verify projects table is intact
    proj_count = db_session.scalar(select(func.count(Project.id)))
    assert proj_count >= 0


# ==============================================================================
# TASK 7 — AUTHORIZATION / IDOR AUDIT TESTS
# ==============================================================================

@pytest.mark.parametrize(
    "method, path, body",
    [
        ("GET", "/api/v1/admin/projects", None),
        (
            "POST",
            "/api/v1/admin/projects",
            {
                "title": "Hacked",
                "slug": "hacked",
                "short_description": "Desc",
                "description": "Full desc",
                "technologies": ["Python"],
            },
        ),
        ("GET", "/api/v1/admin/projects/1", None),
        ("PATCH", "/api/v1/admin/projects/1", {"title": "Updated"}),
        ("DELETE", "/api/v1/admin/projects/1", None),
        ("GET", "/api/v1/admin/messages", None),
        ("PATCH", "/api/v1/admin/messages/1/read", None),
    ],
)
def test_unauthenticated_admin_endpoints_return_401(
    client: TestClient, method: str, path: str, body: dict
) -> None:
    """
    Verify all administrative endpoints reject unauthenticated requests with HTTP 401.
    Knowing /admin or primary key IDs grants zero access.
    """
    if method == "GET":
        res = client.get(path)
    elif method == "POST":
        res = client.post(path, json=body)
    elif method == "PATCH":
        res = client.patch(path, json=body)
    elif method == "DELETE":
        res = client.delete(path)
    else:
        pytest.fail(f"Unhandled HTTP method: {method}")

    assert res.status_code == 401, f"Expected 401 for {method} {path}, got {res.status_code}"
    assert "Authentication credentials were not provided" in res.json()["detail"]


# ==============================================================================
# TASK 8 — CSRF PROTECTION ON CONTACT MESSAGES READ MUTATION
# ==============================================================================

def test_admin_mark_message_read_enforces_csrf(
    client: TestClient, db_session: Session, admin_user: User
) -> None:
    """
    Verify PATCH /api/v1/admin/messages/{id}/read requires CSRF defense when
    cookie authenticated.
    """
    # Create test message
    msg = ContactMessage(
        name="Test Sender",
        email="sender@example.com",
        subject="Hello",
        message="Test message body content",
        is_read=False,
    )
    db_session.add(msg)
    db_session.commit()
    db_session.refresh(msg)

    # 1. Login to establish session cookie
    login_res = client.post(
        "/api/v1/auth/login",
        json={"username": "test_admin", "password": "ValidPassword123!"},
    )
    assert login_res.status_code == 200

    # 2. Mutate with cookie but UNTRUSTED origin -> 403
    untrusted_res = client.patch(
        f"/api/v1/admin/messages/{msg.id}/read",
        headers={
            "Origin": "https://evil-attacker.com",
            "X-Requested-With": "XMLHttpRequest",
        },
    )
    assert untrusted_res.status_code == 403

    # 3. Mutate with cookie, valid origin, but NO custom CSRF header -> 403
    missing_header_res = client.patch(
        f"/api/v1/admin/messages/{msg.id}/read",
        headers={"Origin": "http://localhost:5173"},
    )
    assert missing_header_res.status_code == 403

    # 4. Mutate with cookie, valid origin AND custom CSRF header -> 200
    valid_res = client.patch(
        f"/api/v1/admin/messages/{msg.id}/read",
        headers={
            "Origin": "http://localhost:5173",
            "X-Requested-With": "XMLHttpRequest",
        },
    )
    assert valid_res.status_code == 200
    assert valid_res.json()["is_read"] is True


# ==============================================================================
# TASK 10 — SECURITY HEADERS TESTS
# ==============================================================================

def test_security_headers_present_on_api_responses(client: TestClient) -> None:
    """Verify defensive security headers are applied to HTTP responses."""
    res = client.get("/")
    assert res.status_code == 200

    assert res.headers.get("X-Content-Type-Options") == "nosniff"
    assert res.headers.get("X-Frame-Options") == "DENY"
    assert res.headers.get("Referrer-Policy") == "strict-origin-when-cross-origin"
    assert "camera=()" in res.headers.get("Permissions-Policy", "")

    csp = res.headers.get("Content-Security-Policy", "")
    assert "frame-ancestors 'none'" in csp
    assert "default-src 'self'" in csp


def test_docs_scoped_content_security_policy(client: TestClient) -> None:
    """Verify Swagger UI docs path has compatible CSP for interactive rendering."""
    res = client.get("/api/v1/docs")
    assert res.status_code == 200

    csp = res.headers.get("Content-Security-Policy", "")
    assert "https://cdn.jsdelivr.net" in csp
    assert "frame-ancestors 'none'" in csp
