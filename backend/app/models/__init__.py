"""
SQLAlchemy database models.
Registers Project, User, and ContactMessage models with Base.metadata for Alembic discovery.
"""
from app.core.database import Base
from app.models.contact_message import ContactMessage
from app.models.project import Project
from app.models.user import User

__all__ = ["Base", "ContactMessage", "Project", "User"]
