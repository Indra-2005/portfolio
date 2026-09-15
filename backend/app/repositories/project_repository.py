from typing import Any, Dict, List, Optional, Tuple
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.models.project import Project


class ProjectRepository:
    """
    Data access repository for Project entities.
    Executes SQLAlchemy queries without containing business logic.
    """

    def create(self, db: Session, project: Project) -> Project:
        """Persist a new Project instance in the database."""
        db.add(project)
        db.commit()
        db.refresh(project)
        return project

    def get_by_id(self, db: Session, project_id: int) -> Optional[Project]:
        """Fetch a single Project by its primary key ID."""
        statement = select(Project).where(Project.id == project_id)
        return db.scalars(statement).first()

    def get_by_slug(self, db: Session, slug: str) -> Optional[Project]:
        """Fetch a single Project by its unique slug."""
        statement = select(Project).where(Project.slug == slug)
        return db.scalars(statement).first()

    def exists_by_slug(self, db: Session, slug: str, exclude_id: Optional[int] = None) -> bool:
        """
        Check whether a slug is already taken.
        Optionally excludes an ID to support updates to the same project.
        """
        statement = select(func.count(Project.id)).where(Project.slug == slug)
        if exclude_id is not None:
            statement = statement.where(Project.id != exclude_id)
        count = db.scalar(statement) or 0
        return count > 0

    def list_projects(
        self,
        db: Session,
        *,
        skip: int = 0,
        limit: int = 10,
        published: Optional[bool] = None,
        featured: Optional[bool] = None,
        category: Optional[str] = None,
    ) -> Tuple[List[Project], int]:
        """
        Query projects with optional filtering, pagination, and deterministic ordering.
        Default ordering: display_order ASC, created_at DESC.
        Returns a tuple of (items, total_matching_count).
        """
        # Base query
        query = select(Project)
        count_query = select(func.count(Project.id))

        # Apply filters
        if published is not None:
            query = query.where(Project.published == published)
            count_query = count_query.where(Project.published == published)

        if featured is not None:
            query = query.where(Project.featured == featured)
            count_query = count_query.where(Project.featured == featured)

        if category is not None and category.strip():
            query = query.where(Project.category == category.strip())
            count_query = count_query.where(Project.category == category.strip())

        # Total count before pagination
        total = db.scalar(count_query) or 0

        # Deterministic ordering: display_order ascending, then created_at descending
        query = query.order_by(Project.display_order.asc(), Project.created_at.desc())
        query = query.offset(skip).limit(limit)

        items = list(db.scalars(query).all())
        return items, total

    def update(self, db: Session, project: Project, update_data: Dict[str, Any]) -> Project:
        """Apply partial update dictionary to a Project instance and commit."""
        for field, value in update_data.items():
            setattr(project, field, value)
        db.add(project)
        db.commit()
        db.refresh(project)
        return project

    def delete(self, db: Session, project: Project) -> None:
        """Permanently delete a Project instance."""
        db.delete(project)
        db.commit()


# Singleton repository instance
project_repository = ProjectRepository()
