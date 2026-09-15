from typing import Optional
from urllib.parse import urlparse
from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.repositories.user_repository import user_repository


def verify_csrf_protection(request: Request) -> None:
    """
    CSRF Defense for Cookie-Authenticated Requests.
    
    Protects state-changing requests (POST, PUT, PATCH, DELETE) when authentication 
    is supplied via httpOnly cookies.
    
    Validation mechanisms:
    1. Origin/Referer check: Verifies that the Origin or Referer header matches allowed frontend origins.
    2. Custom Header verification: Rejects simple cross-origin requests that lack the 'X-Requested-With'
       or 'X-CSRF-Token' header (cross-site HTML form submissions cannot attach custom headers without CORS preflight).
    """
    if request.method in ("POST", "PUT", "PATCH", "DELETE"):
        # Only enforce when cookie authentication is actively being used
        has_auth_cookie = bool(request.cookies.get(settings.AUTH_COOKIE_NAME))
        if has_auth_cookie:
            # 1. Custom Header Check
            custom_header = request.headers.get("x-requested-with") or request.headers.get("x-csrf-token")
            
            # 2. Origin / Referer validation
            origin = request.headers.get("origin")
            referer = request.headers.get("referer")
            
            is_valid_origin = False
            target_host = origin or referer
            if target_host:
                parsed = urlparse(target_host)
                origin_base = f"{parsed.scheme}://{parsed.netloc}".rstrip("/")
                # Check against configured CORS origins
                allowed = [o.rstrip("/") for o in settings.BACKEND_CORS_ORIGINS]
                if origin_base in allowed or "localhost" in parsed.netloc or "127.0.0.1" in parsed.netloc:
                    is_valid_origin = True

            # If origin is provided and matches, or custom header is present, request is safe
            if not is_valid_origin and not custom_header:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="CSRF validation failed: State-changing cookie requests must include a valid Origin or X-Requested-With header.",
                )


def get_current_user(
    request: Request,
    db: Session = Depends(get_db),
) -> User:
    """
    Authenticate the current user using either:
    1. httpOnly session cookie (preferred for browser Admin UI)
    2. Authorization: Bearer <token> header (supported for API clients / testing)
    """
    token: Optional[str] = request.cookies.get(settings.AUTH_COOKIE_NAME)
    
    # Fallback to Authorization Bearer header
    if not token:
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1].strip()

    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is invalid or has expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_identifier = payload["sub"]
    # Look up by ID if integer, otherwise by username/email
    if str(user_identifier).isdigit():
        user = user_repository.get_by_id(db, int(user_identifier))
    else:
        user = user_repository.get_by_username_or_email(db, str(user_identifier))

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User associated with this token no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return user


def get_current_active_user(
    current_user: User = Depends(get_current_user),
) -> User:
    """
    Ensure the authenticated user account is enabled and active.
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account has been disabled.",
        )
    return current_user
