from datetime import datetime
import re
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class UserBase(BaseModel):
    """Base fields for User entity."""
    username: str = Field(..., min_length=3, max_length=100, description="Admin username")
    email: str = Field(..., min_length=5, max_length=255, description="Admin email address")
    is_active: bool = Field(default=True, description="Whether the account is active")

    @field_validator("username", mode="before")
    @classmethod
    def validate_username(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip()
            if len(v) < 3:
                raise ValueError("Username must be at least 3 characters.")
            if not re.match(r"^[a-zA-Z0-9_-]+$", v):
                raise ValueError("Username can only contain alphanumeric characters, underscores, and hyphens.")
        return v

    @field_validator("email", mode="before")
    @classmethod
    def validate_email(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip().lower()
            if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", v):
                raise ValueError("Invalid email format.")
        return v


class UserCreate(UserBase):
    """Schema for creating a new user/admin."""
    password: str = Field(..., min_length=8, max_length=128, description="Plaintext password (min 8 characters)")

    model_config = ConfigDict(extra="forbid")

    @field_validator("password", mode="before")
    @classmethod
    def validate_password_not_empty(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip()
            if len(v) < 8:
                raise ValueError("Password must be at least 8 characters long.")
        return v


class UserResponse(UserBase):
    """
    Publicly safe schema for user data.
    CRITICAL: Never exposes hashed_password or secrets.
    """
    id: int = Field(..., description="Unique user ID")
    created_at: datetime = Field(..., description="Timestamp of account creation")
    updated_at: datetime = Field(..., description="Timestamp of last update")

    model_config = ConfigDict(from_attributes=True)


class LoginRequest(BaseModel):
    """Schema for administrator login."""
    username: str = Field(..., min_length=1, max_length=255, description="Username or email address")
    password: str = Field(..., min_length=1, max_length=128, description="Account password")

    model_config = ConfigDict(extra="forbid")

    @field_validator("username", "password", mode="before")
    @classmethod
    def strip_and_check(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip()
            if not v:
                raise ValueError("Field cannot be blank.")
        return v


class AuthStatus(BaseModel):
    """Schema returning current authentication state."""
    authenticated: bool
    user: Optional[UserResponse] = None
    message: Optional[str] = None
