from datetime import datetime
import re
from typing import Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator


class ContactMessageCreate(BaseModel):
    """Schema for submitting a contact message via the public form."""
    name: str = Field(..., min_length=1, max_length=100, description="Sender name")
    email: str = Field(..., min_length=5, max_length=255, description="Sender email address")
    subject: Optional[str] = Field(default=None, max_length=200, description="Message subject")
    message: str = Field(..., min_length=10, max_length=3000, description="Message body")
    honeypot: Optional[str] = Field(
        default=None,
        max_length=100,
        description="Spam prevention hidden field. Must be empty.",
    )

    model_config = ConfigDict(extra="forbid")

    @field_validator("name", "message", mode="before")
    @classmethod
    def strip_and_check_non_empty(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip()
            if not v:
                raise ValueError("Field cannot be blank or contain only whitespace.")
        return v

    @field_validator("email", mode="before")
    @classmethod
    def validate_email(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip().lower()
            if not re.match(r"^[^@\s]+@[^@\s]+\.[^@\s]+$", v):
                raise ValueError("Invalid email format.")
        return v

    @field_validator("subject", mode="before")
    @classmethod
    def strip_optional_subject(cls, v: Optional[str]) -> Optional[str]:
        if isinstance(v, str):
            v = v.strip()
            return v if v else None
        return v


class ContactMessageResponse(BaseModel):
    """Schema for retrieving a contact message (admin only)."""
    id: int
    name: str
    email: str
    subject: Optional[str]
    message: str
    is_read: bool
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


class ContactSuccessResponse(BaseModel):
    """Schema for successful message dispatch response."""
    status: str = "ok"
    message: str = "Thank you for reaching out. Your message has been received."
