from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, verify_csrf_protection
from app.core.database import get_db
from app.models.user import User
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
# Protected: Requires active authenticated administrator session and CSRF check.
# ==============================================================================

@router.post(
    "/admin/projects",
    response_model=ProjectResponse,
    status_code=status.HTTP_201_CREATED,
    summary="[Admin] Create project",
    description="Create a new project record. Requires active administrator authentication.",
    tags=["Projects (Admin)"],
)
def create_project(
    project_in: ProjectCreate,
    current_user: User = Depends(get_current_active_user),
    _csrf: None = Depends(verify_csrf_protection),
    db: Session = Depends(get_db),
) -> ProjectResponse:
    """Create a new project (Admin only)."""
    project = project_service.create_project(db=db, project_in=project_in)
    return ProjectResponse.model_validate(project)


@router.get(
    "/admin/projects",
    response_model=PaginatedResponse[ProjectResponse],
    status_code=status.HTTP_200_OK,
    summary="[Admin] List all projects",
    description="Retrieve paginated projects including both published and drafts. Requires administrator authentication.",
    tags=["Projects (Admin)"],
)
def list_admin_projects(
    page: int = Query(default=1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(default=10, ge=1, le=100, description="Items per page"),
    published: Optional[bool] = Query(default=None, description="Filter by published status"),
    featured: Optional[bool] = Query(default=None, description="Filter by featured status"),
    category: Optional[str] = Query(default=None, description="Filter by category"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> PaginatedResponse[ProjectResponse]:
    """List all projects for content management (Admin only)."""
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
    description="Retrieve project by primary key ID. Requires administrator authentication.",
    tags=["Projects (Admin)"],
)
def get_admin_project(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> ProjectResponse:
    """Retrieve project by ID for editing (Admin only)."""
    project = project_service.get_project_by_id(db=db, project_id=project_id)
    return ProjectResponse.model_validate(project)


@router.patch(
    "/admin/projects/{project_id}",
    response_model=ProjectResponse,
    status_code=status.HTTP_200_OK,
    summary="[Admin] Partial update project",
    description="Update fields of an existing project. Requires administrator authentication.",
    tags=["Projects (Admin)"],
)
def update_admin_project(
    project_id: int,
    project_in: ProjectUpdate,
    current_user: User = Depends(get_current_active_user),
    _csrf: None = Depends(verify_csrf_protection),
    db: Session = Depends(get_db),
) -> ProjectResponse:
    """Update an existing project record (Admin only)."""
    project = project_service.update_project(db=db, project_id=project_id, project_in=project_in)
    return ProjectResponse.model_validate(project)


@router.delete(
    "/admin/projects/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="[Admin] Delete project",
    description="Permanently delete a project record. Requires administrator authentication.",
    tags=["Projects (Admin)"],
)
def delete_admin_project(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    _csrf: None = Depends(verify_csrf_protection),
    db: Session = Depends(get_db),
) -> None:
    """Delete a project record (Admin only)."""
    project_service.delete_project(db=db, project_id=project_id)
