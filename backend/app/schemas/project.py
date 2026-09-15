from datetime import date, datetime
import re
from typing import List, Optional
from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


def validate_url(url: Optional[str]) -> Optional[str]:
    """Helper to validate that an optional URL string is well-formed."""
    if url is None:
        return None
    url = url.strip()
    if not url:
        return None
    if not (url.startswith("http://") or url.startswith("https://")):
        raise ValueError("URL must start with http:// or https://")
    return url


class ProjectBase(BaseModel):
    """Base fields shared across Project schemas."""
    title: str = Field(..., min_length=1, max_length=255, description="Project title")
    slug: str = Field(
        ...,
        min_length=1,
        max_length=255,
        description="URL-friendly unique identifier (e.g. 'smart-traffic-system')",
    )
    short_description: str = Field(..., min_length=1, max_length=500, description="Brief summary for listings")
    description: str = Field(..., min_length=1, description="Full detailed markdown/text description")
    technologies: List[str] = Field(..., min_length=1, description="Array of technologies/tools used")

    category: Optional[str] = Field(default=None, max_length=100, description="Project category (e.g. 'Backend', 'Full Stack')")
    github_url: Optional[str] = Field(default=None, max_length=500, description="GitHub repository link")
    live_demo_url: Optional[str] = Field(default=None, max_length=500, description="Live deployment link")
    image_url: Optional[str] = Field(default=None, max_length=500, description="Hero or preview image link")

    featured: bool = Field(default=False, description="Whether to showcase on home page/featured section")
    published: bool = Field(default=False, description="Whether the project is publicly visible")
    display_order: int = Field(default=0, ge=0, description="Non-negative priority order for display (lower first)")

    start_date: Optional[date] = Field(default=None, description="Project start date")
    completion_date: Optional[date] = Field(default=None, description="Project completion date")

    key_features: Optional[List[str]] = Field(default=None, description="Array of key features")
    challenges: Optional[List[str]] = Field(default=None, description="Array of technical challenges and solutions")

    @field_validator("title", "short_description", "description", mode="before")
    @classmethod
    def strip_and_check_non_empty(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip()
            if not v:
                raise ValueError("Field cannot be blank or contain only whitespace.")
        return v

    @field_validator("slug", mode="before")
    @classmethod
    def validate_slug_format(cls, v: str) -> str:
        if isinstance(v, str):
            v = v.strip().lower()
            if not v:
                raise ValueError("Slug cannot be blank.")
            if not re.match(r"^[a-z0-9]+(?:-[a-z0-9]+)*$", v):
                raise ValueError("Slug must consist of lowercase alphanumeric characters and single hyphens (e.g. 'my-cool-project').")
        return v

    @field_validator("github_url", "live_demo_url", "image_url", mode="before")
    @classmethod
    def validate_urls(cls, v: Optional[str]) -> Optional[str]:
        return validate_url(v)

    @model_validator(mode="after")
    def validate_date_range(self) -> "ProjectBase":
        if self.start_date and self.completion_date:
            if self.completion_date < self.start_date:
                raise ValueError("completion_date cannot be earlier than start_date.")
        return self


class ProjectCreate(ProjectBase):
    """Schema for creating a new Project."""
    pass


class ProjectUpdate(BaseModel):
    """Schema for updating an existing Project (all fields optional)."""
    title: Optional[str] = Field(default=None, min_length=1, max_length=255)
    slug: Optional[str] = Field(default=None, min_length=1, max_length=255)
    short_description: Optional[str] = Field(default=None, min_length=1, max_length=500)
    description: Optional[str] = Field(default=None, min_length=1)
    technologies: Optional[List[str]] = Field(default=None, min_length=1)

    category: Optional[str] = Field(default=None, max_length=100)
    github_url: Optional[str] = Field(default=None, max_length=500)
    live_demo_url: Optional[str] = Field(default=None, max_length=500)
    image_url: Optional[str] = Field(default=None, max_length=500)

    featured: Optional[bool] = None
    published: Optional[bool] = None
    display_order: Optional[int] = Field(default=None, ge=0)

    start_date: Optional[date] = None
    completion_date: Optional[date] = None

    key_features: Optional[List[str]] = None
    challenges: Optional[List[str]] = None

    @field_validator("title", "short_description", "description", mode="before")
    @classmethod
    def strip_and_check_non_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and isinstance(v, str):
            v = v.strip()
            if not v:
                raise ValueError("Field cannot be blank.")
        return v

    @field_validator("slug", mode="before")
    @classmethod
    def validate_slug_format(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and isinstance(v, str):
            v = v.strip().lower()
            if not v:
                raise ValueError("Slug cannot be blank.")
            if not re.match(r"^[a-z0-9]+(?:-[a-z0-9]+)*$", v):
                raise ValueError("Slug must consist of lowercase alphanumeric characters and single hyphens.")
        return v

    @field_validator("github_url", "live_demo_url", "image_url", mode="before")
    @classmethod
    def validate_urls(cls, v: Optional[str]) -> Optional[str]:
        return validate_url(v)

    @model_validator(mode="after")
    def validate_date_range(self) -> "ProjectUpdate":
        if self.start_date and self.completion_date:
            if self.completion_date < self.start_date:
                raise ValueError("completion_date cannot be earlier than start_date.")
        return self


class ProjectResponse(ProjectBase):
    """Schema for Project responses, including system-generated identifiers."""
    id: int = Field(..., description="Unique integer primary key")
    created_at: datetime = Field(..., description="Timestamp of project record creation")
    updated_at: datetime = Field(..., description="Timestamp of last update")

    model_config = ConfigDict(from_attributes=True)
