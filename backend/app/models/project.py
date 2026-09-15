from datetime import date, datetime
from typing import Any, List, Optional
from sqlalchemy import Boolean, Date, DateTime, Integer, JSON, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class Project(Base):
    """
    SQLAlchemy 2.x Project database model.
    Represents projects showcaseable on the portfolio, with content management flags.
    """
    __tablename__ = "projects"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    short_description: Mapped[str] = mapped_column(String(500), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    
    # Naturally list-like fields stored as JSON arrays
    technologies: Mapped[List[str]] = mapped_column(JSON, nullable=False)
    key_features: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)
    challenges: Mapped[Optional[List[str]]] = mapped_column(JSON, nullable=True)

    # Classification & URLs
    category: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    github_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    live_demo_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    image_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Visibility & Presentation Controls
    featured: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    published: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False, index=True)
    display_order: Mapped[int] = mapped_column(Integer, default=0, nullable=False, index=True)

    # Dates
    start_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)
    completion_date: Mapped[Optional[date]] = mapped_column(Date, nullable=True)

    # Timestamps (timezone-aware)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    def __repr__(self) -> str:
        return f"<Project id={self.id} title={self.title!r} slug={self.slug!r} published={self.published}>"
