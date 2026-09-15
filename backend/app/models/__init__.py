"""
SQLAlchemy database models.
Registers models with Base.metadata for Alembic discovery.
"""
from app.core.database import Base
from app.models.project import Project

__all__ = ["Base", "Project"]
