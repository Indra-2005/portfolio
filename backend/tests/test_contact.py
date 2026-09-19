import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.rate_limiter import contact_rate_limiter
from app.models.contact_message import ContactMessage
from app.models.user import User


@pytest.fixture(autouse=True)
def reset_limiter():
    """Ensure rate limiter state is reset before each test."""
    contact_rate_limiter.reset()
    yield
    contact_rate_limiter.reset()


def test_submit_contact_message_success(client: TestClient, db_session: Session) -> None:
    """Verify valid contact form submission creates record and returns 201."""
    payload = {
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "subject": "Engineering Collaboration",
        "message": "Hello Devendra, I came across your portfolio and would like to connect.",
    }
    response = client.post("/api/v1/contact", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "ok"
    assert "received" in data["message"].lower()

    # Check database persistence
    msg = db_session.query(ContactMessage).filter_by(email="jane.doe@example.com").first()
    assert msg is not None
    assert msg.name == "Jane Doe"
    assert msg.subject == "Engineering Collaboration"
    assert msg.is_read is False


def test_submit_contact_message_invalid_email(client: TestClient) -> None:
    """Verify malformed email returns 422 Unprocessable Entity."""
    payload = {
        "name": "Jane Doe",
        "email": "not-a-valid-email",
        "message": "This is a legitimate message with a broken email.",
    }
    response = client.post("/api/v1/contact", json=payload)
    assert response.status_code == 422


def test_submit_contact_message_short_message(client: TestClient) -> None:
    """Verify message with fewer than 10 characters returns 422."""
    payload = {
        "name": "Jane Doe",
        "email": "jane@example.com",
        "message": "Hi",
    }
    response = client.post("/api/v1/contact", json=payload)
    assert response.status_code == 422


def test_submit_contact_message_blank_name(client: TestClient) -> None:
    """Verify blank name returns 422."""
    payload = {
        "name": "   ",
        "email": "jane@example.com",
        "message": "This is a detailed message from an anonymous user.",
    }
    response = client.post("/api/v1/contact", json=payload)
    assert response.status_code == 422


def test_submit_contact_message_honeypot_triggers_400(client: TestClient) -> None:
    """Verify bot filling the hidden honeypot field is rejected with 400."""
    payload = {
        "name": "Spam Bot",
        "email": "bot@spammer.com",
        "message": "Buy our cheap pharmaceutical products now online!",
        "honeypot": "http://spamlink.com",
    }
    response = client.post("/api/v1/contact", json=payload)
    assert response.status_code == 400
    assert "spam" in response.json()["detail"].lower()


def test_submit_contact_message_rate_limiting_triggers_429(client: TestClient) -> None:
    """Verify submitting exceeding maximum requests per window returns 429."""
    payload = {
        "name": "Rapid Submitter",
        "email": "rapid@example.com",
        "message": "A legitimate message sent repeatedly in a tight loop.",
    }
    # Rate limiter allows 5 requests
    for i in range(5):
        resp = client.post("/api/v1/contact", json=payload)
        assert resp.status_code == 201

    # 6th request must trigger 429 Too Many Requests
    excess_resp = client.post("/api/v1/contact", json=payload)
    assert excess_resp.status_code == 429
    assert "rate limit exceeded" in excess_resp.json()["detail"].lower()


def test_admin_list_messages_unauthenticated_returns_401(client: TestClient) -> None:
    """Verify public visitor cannot access admin message list."""
    response = client.get("/api/v1/admin/messages")
    assert response.status_code == 401


def test_admin_list_messages_authenticated(auth_client: TestClient, db_session: Session) -> None:
    """Verify authenticated admin can retrieve submitted contact messages."""
    # Seed a message
    msg = ContactMessage(
        name="Alice Recruiter",
        email="alice@techrecruiting.com",
        subject="Interview Invitation",
        message="We are interested in your systems and backend engineering background.",
    )
    db_session.add(msg)
    db_session.commit()

    response = auth_client.get("/api/v1/admin/messages")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] >= 1
    assert any(item["email"] == "alice@techrecruiting.com" for item in data["items"])


def test_admin_delete_message_authenticated(auth_client: TestClient, db_session: Session) -> None:
    """Verify authenticated admin can delete a message, and it no longer appears in list."""
    msg = ContactMessage(
        name="Bob Inquirer",
        email="bob@example.com",
        subject="Project Discussion",
        message="I would like to discuss a potential software development project.",
    )
    db_session.add(msg)
    db_session.commit()
    db_session.refresh(msg)

    # 1. Delete message
    delete_res = auth_client.delete(f"/api/v1/admin/messages/{msg.id}")
    assert delete_res.status_code == 200
    data = delete_res.json()
    assert data["status"] == "ok"
    assert "deleted" in data["message"].lower()

    # 2. Verify deleted message is gone from database
    db_record = db_session.get(ContactMessage, msg.id)
    assert db_record is None

    # 3. Verify deleted message no longer appears in GET /admin/messages
    list_res = auth_client.get("/api/v1/admin/messages")
    assert list_res.status_code == 200
    list_data = list_res.json()
    assert not any(item["id"] == msg.id for item in list_data["items"])


def test_admin_delete_message_unauthenticated_returns_401(client: TestClient, db_session: Session) -> None:
    """Verify unauthenticated deletion attempt is rejected with 401."""
    msg = ContactMessage(
        name="Target Message",
        email="target@example.com",
        subject="Secret",
        message="This should not be deletable by visitors.",
    )
    db_session.add(msg)
    db_session.commit()
    db_session.refresh(msg)

    response = client.delete(f"/api/v1/admin/messages/{msg.id}")
    assert response.status_code == 401


def test_admin_delete_message_not_found_returns_404(auth_client: TestClient) -> None:
    """Verify deleting a non-existent message ID returns 404."""
    response = auth_client.delete("/api/v1/admin/messages/999999")
    assert response.status_code == 404
    assert "not found" in response.json()["detail"].lower()


def test_admin_delete_message_enforces_csrf(
    client: TestClient, db_session: Session, admin_user: User
) -> None:
    """Verify DELETE /api/v1/admin/messages/{id} enforces CSRF protection."""
    msg = ContactMessage(
        name="CSRF Delete Test",
        email="csrf@example.com",
        subject="CSRF Protection",
        message="Testing CSRF requirements on delete endpoint.",
    )
    db_session.add(msg)
    db_session.commit()
    db_session.refresh(msg)

    # 1. Login to establish cookie
    login_res = client.post(
        "/api/v1/auth/login",
        json={"username": "test_admin", "password": "ValidPassword123!"},
    )
    assert login_res.status_code == 200

    # 2. Reject request with untrusted Origin -> 403
    untrusted_res = client.delete(
        f"/api/v1/admin/messages/{msg.id}",
        headers={
            "Origin": "https://malicious-site.com",
            "X-Requested-With": "XMLHttpRequest",
        },
    )
    assert untrusted_res.status_code == 403
    assert "CSRF validation failed" in untrusted_res.json()["detail"]

    # 3. Reject request with trusted Origin but missing custom CSRF header -> 403
    missing_header_res = client.delete(
        f"/api/v1/admin/messages/{msg.id}",
        headers={"Origin": "http://localhost:5173"},
    )
    assert missing_header_res.status_code == 403
    assert "CSRF validation failed" in missing_header_res.json()["detail"]

    # 4. Accept request with trusted Origin AND custom CSRF header -> 200
    valid_res = client.delete(
        f"/api/v1/admin/messages/{msg.id}",
        headers={
            "Origin": "http://localhost:5173",
            "X-Requested-With": "XMLHttpRequest",
        },
    )
    assert valid_res.status_code == 200
    assert valid_res.json()["status"] == "ok"

    # 5. Verify database confirmation
    assert db_session.get(ContactMessage, msg.id) is None
