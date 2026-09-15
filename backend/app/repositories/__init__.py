"""
Repository data access layer.
Encapsulates database operations using SQLAlchemy sessions.
"""
from app.repositories.project_repository import ProjectRepository, project_repository

__all__ = ["ProjectRepository", "project_repository"]
