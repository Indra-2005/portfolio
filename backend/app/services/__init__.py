"""
Business logic service layer.
Encapsulates application business rules, keeping routes and database access decoupled.
"""
from app.services.auth_service import AuthService, auth_service
from app.services.contact_service import ContactService, contact_service
from app.services.project_service import ProjectService, project_service

__all__ = [
    "AuthService",
    "ContactService",
    "ProjectService",
    "auth_service",
    "contact_service",
    "project_service",
]
