import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.rate_limiter import contact_rate_limiter
from app.models.contact_message import ContactMessage


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
