from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.pagination import PaginatedResponse
from app.schemas.project import ProjectCreate, ProjectResponse, ProjectUpdate
from app.services.project_service import project_service

router = APIRouter()

# ==============================================================================
# PUBLIC PROJECT ENDPOINTS
# Exclusively exposes published projects for portfolio visitors.
# ==============================================================================

@router.get(
    "/projects",
    response_model=PaginatedResponse[ProjectResponse],
    status_code=status.HTTP_200_OK,
    summary="List published projects",
    description="Retrieve paginated list of published projects ordered by display_order ASC, then created_at DESC.",
    tags=["Projects (Public)"],
)
def list_published_projects(
    page: int = Query(default=1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(default=10, ge=1, le=100, description="Items per page"),
    featured: Optional[bool] = Query(default=None, description="Filter by featured status"),
    category: Optional[str] = Query(default=None, description="Filter by project category"),
    db: Session = Depends(get_db),
) -> PaginatedResponse[ProjectResponse]:
    """Return paginated published projects for public portfolio display."""
    return project_service.list_public_projects(
        db=db,
        page=page,
        page_size=page_size,
        featured=featured,
        category=category,
    )


@router.get(
    "/projects/{slug}",
    response_model=ProjectResponse,
    status_code=status.HTTP_200_OK,
    summary="Get published project by slug",
    description="Retrieve a single published project by its URL slug. Returns 404 if not found or unpublished.",
    tags=["Projects (Public)"],
)
def get_published_project_by_slug(
    slug: str,
    db: Session = Depends(get_db),
) -> ProjectResponse:
    """Return a single published project by slug."""
    project = project_service.get_public_project_by_slug(db=db, slug=slug)
    return ProjectResponse.model_validate(project)


# ==============================================================================
# ADMIN / CONTENT MANAGEMENT ENDPOINTS
# TODO (Phase 3): These endpoints are intentionally unauthenticated during Phase 2
# development. JWT / OAuth2 authentication and authorization guards MUST be added
# in Phase 3 before any production deployment.
# ==============================================================================

@router.post(
    "/admin/projects",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="[Admin] Create project",
    description=(
        "Create a new project record. "
        "NOTE: Intentionally unauthenticated in Phase 2; authentication will be added in Phase 3."
    ),
    tags=["Projects (Admin)"],
)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
) -> ProjectResponse:
    """Create a new project."""
    project = project_service.create_project(db=db, project_in=project_in)
    return ProjectResponse.model_validate(project)


@router.get(
    "/admin/projects",
    response_model=PaginatedResponse[ProjectResponse],
    status_code=status.HTTP_200_OK,
    summary="[Admin] List all projects",
    description=(
        "Retrieve paginated projects including both published and unpublished records. "
        "NOTE: Intentionally unauthenticated in Phase 2; authentication will be added in Phase 3."
    ),
    tags=["Projects (Admin)"],
)
def list_admin_projects(
    page: int = Query(default=1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(default=10, ge=1, le=100, description="Items per page"),
    published: Optional[bool] = Query(default=None, description="Filter by published status"),
    featured: Optional[bool] = Query(default=None, description="Filter by featured status"),
    category: Optional[str] = Query(default=None, description="Filter by category"),
    db: Session = Depends(get_db),
) -> PaginatedResponse[ProjectResponse]:
    """List all projects for content management."""
    return project_service.list_admin_projects(
        db=db,
        page=page,
        page_size=page_size,
        published=published,
        featured=featured,
        category=category,
    )


@router.get(
    "/admin/projects/{project_id}",
    response_model=ProjectResponse,
    status_code=status.HTTP_200_OK,
    summary="[Admin] Get project by ID",
    description=(
        "Retrieve project by primary key ID. "
        "NOTE: Intentionally unauthenticated in Phase 2; authentication will be added in Phase 3."
    ),
    tags=["Projects (Admin)"],
)
def get_admin_project(
    project_id: int,
    db: Session = Depends(get_db),
) -> ProjectResponse:
    """Retrieve project by ID for editing."""
    project = project_service.get_project_by_id(db=db, project_id=project_id)
    return ProjectResponse.model_validate(project)


@router.patch(
    "/admin/projects/{project_id}",
    response_model=ProjectResponse,
    status_code=status.HTTP_200_OK,
    summary="[Admin] Partial update project",
    description=(
        "Update fields of an existing project. "
        "NOTE: Intentionally unauthenticated in Phase 2; authentication will be added in Phase 3."
    ),
    tags=["Projects (Admin)"],
)
def update_admin_project(
    project_id: int,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db),
) -> ProjectResponse:
    """Update an existing project record."""
    project = project_service.update_project(db=db, project_id=project_id, project_in=project_in)
    return ProjectResponse.model_validate(project)


@router.delete(
    "/admin/projects/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="[Admin] Delete project",
    description=(
        "Permanently delete a project record. "
        "NOTE: Intentionally unauthenticated in Phase 2; authentication will be added in Phase 3."
    ),
    tags=["Projects (Admin)"],
)
def delete_admin_project(
    project_id: int,
    db: Session = Depends(get_db),
) -> None:
    """Delete a project record."""
    project_service.delete_project(db=db, project_id=project_id)
