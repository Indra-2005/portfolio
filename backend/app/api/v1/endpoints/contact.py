import math
from typing import Optional
from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user, verify_csrf_protection
from app.core.database import get_db
from app.core.rate_limiter import contact_rate_limiter
from app.models.user import User
from app.schemas.contact import (
    ContactMessageCreate,
    ContactMessageResponse,
    ContactSuccessResponse,
)
from app.schemas.pagination import PaginatedResponse
from app.services.contact_service import contact_service

router = APIRouter()


@router.post(
    "/contact",
    response_model=ContactSuccessResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Submit contact inquiry",
    description="Submit a message from the public portfolio contact form. Protected by rate limiting and honeypot spam detection.",
    tags=["Contact"],
    dependencies=[Depends(contact_rate_limiter)],
)
def submit_contact_message(
    message_in: ContactMessageCreate,
    db: Session = Depends(get_db),
) -> ContactSuccessResponse:
    """Submit contact message and persist to database."""
    contact_service.process_message(db=db, message_in=message_in)
    return ContactSuccessResponse()


@router.get(
    "/admin/messages",
    response_model=PaginatedResponse[ContactMessageResponse],
    status_code=status.HTTP_200_OK,
    summary="[Admin] List contact messages",
    description="Retrieve submitted contact messages. Requires active administrator session.",
    tags=["Contact (Admin)"],
)
def list_contact_messages(
    page: int = Query(default=1, ge=1, description="Page number (1-indexed)"),
    page_size: int = Query(default=50, ge=1, le=100, description="Items per page"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db),
) -> PaginatedResponse[ContactMessageResponse]:
    """List contact messages (Admin only)."""
    items, total = contact_service.list_messages(db=db, page=page, page_size=page_size)
    total_pages = math.ceil(total / page_size) if total > 0 else 0

    return PaginatedResponse(
        items=[ContactMessageResponse.model_validate(item) for item in items],
        page=page,
        page_size=page_size,
        total=total,
        total_pages=total_pages,
    )


@router.patch(
    "/admin/messages/{message_id}/read",
    response_model=ContactMessageResponse,
    status_code=status.HTTP_200_OK,
    summary="[Admin] Mark message as read",
    description="Mark a contact message as read.",
    tags=["Contact (Admin)"],
)
def mark_message_as_read(
    message_id: int,
    current_user: User = Depends(get_current_active_user),
    _csrf: None = Depends(verify_csrf_protection),
    db: Session = Depends(get_db),
) -> ContactMessageResponse:
    """Mark a message as read (Admin only)."""
    msg = contact_service.mark_as_read(db=db, message_id=message_id)
    return ContactMessageResponse.model_validate(msg)
