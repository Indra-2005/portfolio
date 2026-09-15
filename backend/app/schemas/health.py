from pydantic import BaseModel, Field


class HealthResponse(BaseModel):
    """Schema for API health status verification."""
    status: str = Field(default="ok", description="Current operational status of the service")
