import math
from typing import Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.project import Project
from app.repositories.project_repository import ProjectRepository, project_repository
from app.schemas.pagination import PaginatedResponse
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate


class ProjectService:
    """
    Business logic service for Project operations.
    Enforces uniqueness constraints, publication visibility, and domain validation.
    """

    def __init__(self, repo: ProjectRepository = project_repository) -> None:
        self.repo = repo

    def create_project(self, db: Session, project_in: ProjectCreate) -> Project:
        """
        Create a new project.
        Business Rule: Slug must be unique.
        """
        if self.repo.exists_by_slug(db, project_in.slug):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"A project with slug '{project_in.slug}' already exists.",
            )

        project_data = project_in.model_dump()
        project = Project(**project_data)
        return self.repo.create(db, project)

    def get_public_project_by_slug(self, db: Session, slug: str) -> Project:
        """
        Retrieve a project for public display by its slug.
        Business Rule: Only published projects can be accessed publicly.
        Unpublished or missing slugs return 404.
        """
        project = self.repo.get_by_slug(db, slug)
        if not project or not project.published:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project '{slug}' was not found.",
            )
        return project

    def get_project_by_id(self, db: Session, project_id: int) -> Project:
        """
        Retrieve a project by its primary key ID (admin/management).
        """
        project = self.repo.get_by_id(db, project_id)
        if not project:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Project with ID {project_id} was not found.",
            )
        return project

    def list_public_projects(
        self,
        db: Session,
        *,
        page: int = 1,
        page_size: int = 10,
        featured: Optional[bool] = None,
        category: Optional[str] = None,
    ) -> PaginatedResponse[ProjectResponse]:
        """
        List published projects for public display with pagination and optional filters.
        Business Rule: Only published projects are returned.
        """
        skip = (page - 1) * page_size
        items, total = self.repo.list_projects(
            db,
            skip=skip,
            limit=page_size,
            published=True,  # Strictly enforce published
            featured=featured,
            category=category,
        )
        total_pages = math.ceil(total / page_size) if total > 0 else 0

        return PaginatedResponse(
            items=[ProjectResponse.model_validate(item) for item in items],
            page=page,
            page_size=page_size,
            total=total,
            total_pages=total_pages,
        )

    def list_admin_projects(
        self,
        db: Session,
        *,
        page: int = 1,
        page_size: int = 10,
        published: Optional[bool] = None,
        featured: Optional[bool] = None,
        category: Optional[str] = None,
    ) -> PaginatedResponse[ProjectResponse]:
        """
        List projects for administrative management.
        Allows viewing both published and unpublished projects.
        """
        skip = (page - 1) * page_size
        items, total = self.repo.list_projects(
            db,
            skip=skip,
            limit=page_size,
            published=published,
            featured=featured,
            category=category,
        )
        total_pages = math.ceil(total / page_size) if total > 0 else 0

        return PaginatedResponse(
            items=[ProjectResponse.model_validate(item) for item in items],
            page=page,
            page_size=page_size,
            total=total,
            total_pages=total_pages,
        )

    def update_project(
        self,
        db: Session,
        project_id: int,
        project_in: ProjectUpdate,
    ) -> Project:
        """
        Update an existing project (partial update).
        Business Rule: If updating the slug, ensure the new slug is not already taken by another project.
        """
        project = self.get_project_by_id(db, project_id)

        update_data = project_in.model_dump(exclude_unset=True)
        if not update_data:
            return project

        # Check slug uniqueness if it is being changed
        new_slug = update_data.get("slug")
        if new_slug and new_slug != project.slug:
            if self.repo.exists_by_slug(db, new_slug, exclude_id=project.id):
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"A project with slug '{new_slug}' already exists.",
                )

        return self.repo.update(db, project, update_data)

    def delete_project(self, db: Session, project_id: int) -> None:
        """
        Permanently delete a project.
        """
        project = self.get_project_by_id(db, project_id)
        self.repo.delete(db, project)


# Singleton service instance
project_service = ProjectService()
