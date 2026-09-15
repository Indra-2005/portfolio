"""
Business logic service layer.
Encapsulates application business rules, keeping routes and database access decoupled.
"""
from app.services.project_service import ProjectService, project_service

__all__ = ["ProjectService", "project_service"]
