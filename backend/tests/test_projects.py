from datetime import date
import pytest
from pydantic import ValidationError
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.models.project import Project
from app.schemas.project import ProjectCreate, ProjectUpdate


# ==============================================================================
# 1. MODEL & DATABASE TESTS
# ==============================================================================

def test_project_model_creation_and_defaults(db_session: Session) -> None:
    """Verify that Project model creates records with proper default values."""
    project = Project(
        title="Distributed Task Queue",
        slug="distributed-task-queue",
        short_description="An asynchronous job execution engine.",
        description="Detailed description of the task queue built with Redis and Python.",
        technologies=["Python", "Redis", "FastAPI"],
    )
    db_session.add(project)
    db_session.commit()
    db_session.refresh(project)

    assert project.id is not None
    assert project.featured is False
    assert project.published is False
    assert project.display_order == 0
    assert project.created_at is not None
    assert project.updated_at is not None
    assert "Python" in project.technologies


def test_project_unique_slug_constraint(db_session: Session) -> None:
    """Verify that the database enforces unique slug constraint."""
    p1 = Project(
        title="Project One",
        slug="shared-slug",
        short_description="First project.",
        description="First description.",
        technologies=["Python"],
    )
    db_session.add(p1)
    db_session.commit()

    p2 = Project(
        title="Project Two",
        slug="shared-slug",  # Duplicate slug
        short_description="Second project.",
        description="Second description.",
        technologies=["Python"],
    )
    db_session.add(p2)
    with pytest.raises(IntegrityError):
        db_session.commit()
    db_session.rollback()


# ==============================================================================
# 2. SCHEMA VALIDATION TESTS
# ==============================================================================

def test_schema_required_fields() -> None:
    """Verify that ProjectCreate raises validation error when required fields are missing."""
    with pytest.raises(ValidationError) as exc_info:
        ProjectCreate.model_validate({})
    errors = exc_info.value.errors()
    missing_fields = {e["loc"][0] for e in errors}
    assert {"title", "slug", "short_description", "description", "technologies"}.issubset(missing_fields)


def test_schema_blank_title_rejected() -> None:
    """Verify that empty or whitespace-only titles are rejected."""
    with pytest.raises(ValidationError) as exc:
        ProjectCreate(
            title="   ",
            slug="valid-slug",
            short_description="Desc",
            description="Long desc",
            technologies=["Python"],
        )
    assert "Field cannot be blank" in str(exc.value)


def test_schema_blank_and_invalid_slug_rejected() -> None:
    """Verify that blank or malformed slugs (spaces, uppercase, symbols) are rejected."""
    # Blank slug
    with pytest.raises(ValidationError):
        ProjectCreate(
            title="Valid Title",
            slug="   ",
            short_description="Desc",
            description="Long desc",
            technologies=["Python"],
        )

    # Invalid characters in slug
    with pytest.raises(ValidationError) as exc:
        ProjectCreate(
            title="Valid Title",
            slug="Invalid Slug with Spaces!",
            short_description="Desc",
            description="Long desc",
            technologies=["Python"],
        )
    assert "Slug must consist of lowercase alphanumeric" in str(exc.value)


def test_schema_negative_display_order_rejected() -> None:
    """Verify that display_order cannot be negative."""
    with pytest.raises(ValidationError):
        ProjectCreate(
            title="Valid Title",
            slug="valid-slug",
            short_description="Desc",
            description="Long desc",
            technologies=["Python"],
            display_order=-1,
        )


def test_schema_invalid_date_range_rejected() -> None:
    """Verify that completion_date cannot be earlier than start_date."""
    with pytest.raises(ValidationError) as exc:
        ProjectCreate(
            title="Valid Title",
            slug="valid-slug",
            short_description="Desc",
            description="Long desc",
            technologies=["Python"],
            start_date=date(2026, 6, 1),
            completion_date=date(2026, 1, 1),  # earlier than start
        )
    assert "completion_date cannot be earlier than start_date" in str(exc.value)


# ==============================================================================
# 3. PUBLIC API TESTS
# ==============================================================================

def test_public_projects_only_returns_published(client) -> None:
    """Ensure GET /api/v1/projects exclusively returns published projects."""
    # Create one published and one unpublished project via admin
    client.post(
        "/api/v1/admin/projects",
        json={
            "title": "Published Project",
            "slug": "pub-proj",
            "short_description": "Short desc",
            "description": "Full desc",
            "technologies": ["FastAPI", "React"],
            "published": True,
        },
    )
    client.post(
        "/api/v1/admin/projects",
        json={
            "title": "Unpublished Draft",
            "slug": "unpub-proj",
            "short_description": "Short desc",
            "description": "Full desc",
            "technologies": ["Python"],
            "published": False,
        },
    )

    response = client.get("/api/v1/projects")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 1
    assert len(data["items"]) == 1
    assert data["items"][0]["slug"] == "pub-proj"


def test_public_projects_filtering(client) -> None:
    """Test featured and category filtering on public projects."""
    # Project A: Backend, featured
    client.post(
        "/api/v1/admin/projects",
        json={
            "title": "API Gateway",
            "slug": "api-gateway",
            "short_description": "Gateway",
            "description": "Long desc",
            "technologies": ["Go", "Python"],
            "category": "Backend",
            "featured": True,
            "published": True,
        },
    )
    # Project B: Frontend, not featured
    client.post(
        "/api/v1/admin/projects",
        json={
            "title": "Dashboard UI",
            "slug": "dashboard-ui",
            "short_description": "UI",
            "description": "Long desc",
            "technologies": ["React"],
            "category": "Frontend",
            "featured": False,
            "published": True,
        },
    )

    # Filter featured=true
    r_featured = client.get("/api/v1/projects?featured=true")
    assert r_featured.status_code == 200
    d_featured = r_featured.json()
    assert d_featured["total"] == 1
    assert d_featured["items"][0]["slug"] == "api-gateway"

    # Filter category=Frontend
    r_cat = client.get("/api/v1/projects?category=Frontend")
    assert r_cat.status_code == 200
    d_cat = r_cat.json()
    assert d_cat["total"] == 1
    assert d_cat["items"][0]["slug"] == "dashboard-ui"


def test_public_projects_pagination_and_ordering(client) -> None:
    """Verify pagination calculation and deterministic ordering by display_order ASC."""
    for i in range(5):
        client.post(
            "/api/v1/admin/projects",
            json={
                "title": f"Project {i}",
                "slug": f"project-{i}",
                "short_description": f"Desc {i}",
                "description": f"Long desc {i}",
                "technologies": ["Python"],
                "display_order": 10 - i,  # Reverse order
                "published": True,
            },
        )

    # Request page 1 with page_size 2
    r = client.get("/api/v1/projects?page=1&page_size=2")
    assert r.status_code == 200
    data = r.json()
    assert data["page"] == 1
    assert data["page_size"] == 2
    assert data["total"] == 5
    assert data["total_pages"] == 3
    assert len(data["items"]) == 2

    # Lowest display_order should come first (project-4 has order 6, project-3 has order 7)
    assert data["items"][0]["slug"] == "project-4"
    assert data["items"][1]["slug"] == "project-3"


def test_public_project_by_slug(client) -> None:
    """Test retrieving published project by slug, and 404 for unpublished or nonexistent."""
    client.post(
        "/api/v1/admin/projects",
        json={
            "title": "Live Project",
            "slug": "live-project",
            "short_description": "Desc",
            "description": "Long desc",
            "technologies": ["Python"],
            "published": True,
        },
    )
    client.post(
        "/api/v1/admin/projects",
        json={
            "title": "Draft Project",
            "slug": "draft-project",
            "short_description": "Desc",
            "description": "Long desc",
            "technologies": ["Python"],
            "published": False,
        },
    )

    # 1. Published project returns 200
    r_live = client.get("/api/v1/projects/live-project")
    assert r_live.status_code == 200
    assert r_live.json()["slug"] == "live-project"

    # 2. Unpublished project returns 404
    r_draft = client.get("/api/v1/projects/draft-project")
    assert r_draft.status_code == 404

    # 3. Nonexistent slug returns 404
    r_missing = client.get("/api/v1/projects/does-not-exist")
    assert r_missing.status_code == 404


# ==============================================================================
# 4. ADMIN API TESTS
# ==============================================================================

def test_admin_create_project(client) -> None:
    """Test creating a project record via POST /api/v1/admin/projects."""
    payload = {
        "title": "Real-Time Telemetry",
        "slug": "real-time-telemetry",
        "short_description": "IoT data pipeline",
        "description": "Detailed architecture of telemetry system.",
        "technologies": ["Python", "Kafka", "PostgreSQL"],
        "category": "Backend",
        "github_url": "https://github.com/example/telemetry",
        "featured": True,
        "published": False,
        "display_order": 1,
    }
    response = client.post("/api/v1/admin/projects", json=payload)
    assert response.status_code == 201
    data = response.json()
    assert data["id"] is not None
    assert data["title"] == payload["title"]
    assert data["slug"] == payload["slug"]
    assert data["github_url"] == payload["github_url"]
    assert data["featured"] is True
    assert data["published"] is False


def test_admin_create_duplicate_slug_returns_409(client) -> None:
    """Verify that attempting to create a project with an existing slug returns 409 Conflict."""
    payload = {
        "title": "Unique Project",
        "slug": "duplicate-slug",
        "short_description": "Desc",
        "description": "Full desc",
        "technologies": ["Python"],
    }
    r1 = client.post("/api/v1/admin/projects", json=payload)
    assert r1.status_code == 201

    r2 = client.post("/api/v1/admin/projects", json=payload)
    assert r2.status_code == 409
    assert "already exists" in r2.json()["detail"]


def test_admin_list_projects_includes_unpublished(client) -> None:
    """Verify GET /api/v1/admin/projects returns both published and draft projects."""
    client.post(
        "/api/v1/admin/projects",
        json={
            "title": "A",
            "slug": "proj-a",
            "short_description": "Desc A",
            "description": "Full desc A",
            "technologies": ["Python"],
            "published": True,
        },
    )
    client.post(
        "/api/v1/admin/projects",
        json={
            "title": "B",
            "slug": "proj-b",
            "short_description": "Desc B",
            "description": "Full desc B",
            "technologies": ["Python"],
            "published": False,
        },
    )

    response = client.get("/api/v1/admin/projects")
    assert response.status_code == 200
    data = response.json()
    assert data["total"] == 2
    slugs = {item["slug"] for item in data["items"]}
    assert slugs == {"proj-a", "proj-b"}


def test_admin_get_project_by_id(client) -> None:
    """Verify GET /api/v1/admin/projects/{id} returns 200 for existing, 404 for missing."""
    r_create = client.post(
        "/api/v1/admin/projects",
        json={
            "title": "Look Me Up",
            "slug": "look-me-up",
            "short_description": "Desc",
            "description": "Full desc",
            "technologies": ["Python"],
        },
    )
    proj_id = r_create.json()["id"]

    # Existing
    r_found = client.get(f"/api/v1/admin/projects/{proj_id}")
    assert r_found.status_code == 200
    assert r_found.json()["id"] == proj_id

    # Nonexistent
    r_missing = client.get("/api/v1/admin/projects/999999")
    assert r_missing.status_code == 404


def test_admin_update_project(client) -> None:
    """Test partial update via PATCH /api/v1/admin/projects/{id}."""
    r_create = client.post(
        "/api/v1/admin/projects",
        json={
            "title": "Initial Title",
            "slug": "initial-title",
            "short_description": "Initial desc",
            "description": "Full initial desc",
            "technologies": ["Python"],
            "published": False,
        },
    )
    proj_id = r_create.json()["id"]

    # Partial update: publish and change title
    update_payload = {
        "title": "Updated Title",
        "published": True,
    }
    r_patch = client.patch(f"/api/v1/admin/projects/{proj_id}", json=update_payload)
    assert r_patch.status_code == 200
    updated_data = r_patch.json()
    assert updated_data["title"] == "Updated Title"
    assert updated_data["published"] is True
    assert updated_data["slug"] == "initial-title"  # Unchanged


def test_admin_update_slug_conflict_returns_409(client) -> None:
    """Test that updating a project's slug to one already used by another project returns 409."""
    client.post(
        "/api/v1/admin/projects",
        json={
            "title": "Alpha",
            "slug": "slug-alpha",
            "short_description": "Desc",
            "description": "Full desc",
            "technologies": ["Python"],
        },
    )
    r2 = client.post(
        "/api/v1/admin/projects",
        json={
            "title": "Beta",
            "slug": "slug-beta",
            "short_description": "Desc",
            "description": "Full desc",
            "technologies": ["Python"],
        },
    )
    beta_id = r2.json()["id"]

    # Try updating Beta's slug to Alpha's slug
    r_conflict = client.patch(f"/api/v1/admin/projects/{beta_id}", json={"slug": "slug-alpha"})
    assert r_conflict.status_code == 409


def test_admin_delete_project(client) -> None:
    """Test deleting project returns 204, and subsequent retrieval returns 404."""
    r_create = client.post(
        "/api/v1/admin/projects",
        json={
            "title": "To Be Deleted",
            "slug": "to-be-deleted",
            "short_description": "Desc",
            "description": "Full desc",
            "technologies": ["Python"],
        },
    )
    proj_id = r_create.json()["id"]

    # Delete
    r_delete = client.delete(f"/api/v1/admin/projects/{proj_id}")
    assert r_delete.status_code == 204

    # Subsequent GET returns 404
    r_verify = client.get(f"/api/v1/admin/projects/{proj_id}")
    assert r_verify.status_code == 404

    # Deleting nonexistent returns 404
    r_del_again = client.delete(f"/api/v1/admin/projects/{proj_id}")
    assert r_del_again.status_code == 404
