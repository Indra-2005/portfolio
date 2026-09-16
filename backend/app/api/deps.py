import logging
from typing import Optional
from urllib.parse import urlparse

from fastapi import Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.database import get_db
from app.core.rate_limiter import get_client_ip
from app.core.security import decode_access_token
from app.models.user import User
from app.repositories.user_repository import user_repository

logger = logging.getLogger("security")


def verify_csrf_protection(request: Request) -> None:
    """
    CSRF Defense for Cookie-Authenticated Requests.

    Protects state-changing requests (POST, PUT, PATCH, DELETE) when
    authentication is supplied via an httpOnly cookie.

    Cookie-authenticated state-changing requests must satisfy BOTH:
    1. Origin/Referer must match a configured trusted frontend origin.
    2. A custom request header (X-Requested-With or X-CSRF-Token) must exist.

    This prevents ordinary cross-site form requests from performing
    authenticated state-changing actions because browsers do not allow
    cross-origin HTML forms to attach arbitrary custom headers.

    Bearer-token requests are not subject to this CSRF check because the
    bearer token must be explicitly supplied by the API client rather than
    being automatically attached by the browser.
    """

    if request.method not in ("POST", "PUT", "PATCH", "DELETE"):
        return

    # Only enforce CSRF protection when authentication is supplied
    # through the browser's authentication cookie.
    has_auth_cookie = bool(
        request.cookies.get(settings.AUTH_COOKIE_NAME)
    )

    if not has_auth_cookie:
        return

    client_ip = get_client_ip(request)

    # ------------------------------------------------------------------
    # 1. Validate Origin / Referer
    # ------------------------------------------------------------------

    origin = request.headers.get("origin")
    referer = request.headers.get("referer")

    # Prefer Origin when available; otherwise use Referer.
    target = origin or referer

    if not target:
        logger.warning(
            "Security event: CSRF validation failed from ip=%s reason='missing Origin or Referer'",
            client_ip,
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "CSRF validation failed: "
                "missing Origin or Referer."
            ),
        )

    parsed = urlparse(target)

    if not parsed.scheme or not parsed.netloc:
        logger.warning(
            "Security event: CSRF validation failed from ip=%s reason='invalid Origin or Referer'",
            client_ip,
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "CSRF validation failed: "
                "invalid Origin or Referer."
            ),
        )

    # Construct the origin without path/query information.
    origin_base = (
        f"{parsed.scheme}://{parsed.netloc}"
    ).rstrip("/")

    # Normalize configured trusted origins.
    allowed_origins = {
        str(origin).rstrip("/")
        for origin in settings.BACKEND_CORS_ORIGINS
    }

    # Require an exact trusted-origin match.
    if origin_base not in allowed_origins:
        logger.warning(
            "Security event: CSRF validation failed from ip=%s reason='untrusted Origin' origin=%s",
            client_ip,
            origin_base,
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "CSRF validation failed: "
                "untrusted Origin or Referer."
            ),
        )

    # ------------------------------------------------------------------
    # 2. Require a custom request header
    # ------------------------------------------------------------------

    custom_header = (
        request.headers.get("x-requested-with")
        or request.headers.get("x-csrf-token")
    )

    if not custom_header:
        logger.warning(
            "Security event: CSRF validation failed from ip=%s reason='missing custom CSRF header'",
            client_ip,
        )
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=(
                "CSRF validation failed: "
                "cookie-authenticated state-changing requests "
                "require a trusted Origin/Referer and a CSRF "
                "request header."
            ),
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
    client_ip = get_client_ip(request)

    token: Optional[str] = request.cookies.get(
        settings.AUTH_COOKIE_NAME
    )

    # Fallback to Authorization Bearer header.
    if not token:
        auth_header = request.headers.get("Authorization")

        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ", 1)[1].strip()

    if not token:
        logger.warning(
            "Security event: Unauthorized access attempt without credentials from ip=%s path=%s",
            client_ip,
            request.url.path,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials were not provided.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    payload = decode_access_token(token)

    if not payload or "sub" not in payload:
        logger.warning(
            "Security event: Unauthorized access attempt with invalid/expired token from ip=%s path=%s",
            client_ip,
            request.url.path,
        )
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication token is invalid or has expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user_identifier = payload["sub"]

    # Look up by ID if integer, otherwise by username/email.
    if str(user_identifier).isdigit():
        user = user_repository.get_by_id(
            db,
            int(user_identifier),
        )
    else:
        user = user_repository.get_by_username_or_email(
            db,
            str(user_identifier),
        )

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