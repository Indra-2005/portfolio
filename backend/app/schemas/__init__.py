"""Pydantic schemas for data validation and API serialization."""
from app.schemas.contact import (
    ContactMessageCreate,
    ContactMessageResponse,
    ContactSuccessResponse,
)
from app.schemas.health import HealthResponse
from app.schemas.pagination import PaginatedResponse
from app.schemas.project import ProjectBase, ProjectCreate, ProjectResponse, ProjectUpdate
from app.schemas.user import AuthStatus, LoginRequest, UserBase, UserCreate, UserResponse

__all__ = [
    "AuthStatus",
    "ContactMessageCreate",
    "ContactMessageResponse",
    "ContactSuccessResponse",
    "HealthResponse",
    "LoginRequest",
    "PaginatedResponse",
    "ProjectBase",
    "ProjectCreate",
    "ProjectResponse",
    "ProjectUpdate",
    "UserBase",
    "UserCreate",
    "UserResponse",
]
