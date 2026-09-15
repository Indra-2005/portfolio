from fastapi.testclient import TestClient
from app.main import app
from app.core.config import settings

client = TestClient(app)


def test_health_check_endpoint():
    """Verify that the /api/v1/health endpoint returns 200 and {'status': 'ok'}."""
    response = client.get(f"{settings.API_V1_STR}/health")
    assert response.status_code == 200
    data = response.json()
    assert data == {"status": "ok"}


def test_root_endpoint():
    """Verify that the root endpoint returns service info and documentation links."""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["service"] == settings.PROJECT_NAME
    assert data["health"] == f"{settings.API_V1_STR}/health"
