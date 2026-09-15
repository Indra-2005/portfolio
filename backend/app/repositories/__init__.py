"""
Repository data access layer.
Encapsulates database operations using SQLAlchemy sessions.
"""
from app.repositories.contact_repository import ContactRepository, contact_repository
from app.repositories.project_repository import ProjectRepository, project_repository
from app.repositories.user_repository import UserRepository, user_repository

__all__ = [
    "ContactRepository",
    "ProjectRepository",
    "UserRepository",
    "contact_repository",
    "project_repository",
    "user_repository",
]
