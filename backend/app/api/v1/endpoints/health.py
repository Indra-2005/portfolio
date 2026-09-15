from fastapi import APIRouter, status
from app.schemas.health import HealthResponse

router = APIRouter()


@router.get(
    "/health",
    response_model=HealthResponse,
    status_code=status.HTTP_200_OK,
    summary="Health check",
    description="Returns the operational status of the backend service.",
)
def get_health() -> HealthResponse:
    """Check that the API service is alive and healthy."""
    return HealthResponse(status="ok")
