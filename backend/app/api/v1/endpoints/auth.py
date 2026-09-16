import logging
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.core.config import settings
from app.core.database import get_db
from app.core.rate_limiter import get_client_ip, login_failure_limiter
from app.core.security import create_access_token
from app.models.user import User
from app.schemas.user import LoginRequest, UserResponse
from app.services.auth_service import auth_service

logger = logging.getLogger("security")

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/login",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Admin login",
    description="Authenticate credentials and set a secure httpOnly session cookie with brute-force protection.",
)
def login(
    login_in: LoginRequest,
    response: Response,
    request: Request,
    db: Session = Depends(get_db),
) -> UserResponse:
    """
    Authenticate administrator and establish httpOnly session cookie.
    Protected against brute-force attacks via sliding-window LoginFailureLimiter.
    Never stores or returns tokens in localStorage.
    """
    normalized_identifier = login_in.username.strip().lower()
    client_ip = get_client_ip(request)

    # 1. Check brute-force lockout state before running expensive password hashing
    login_failure_limiter.check_rate_limit(request, normalized_identifier)

    # 2. Attempt credentials verification
    try:
        user = auth_service.authenticate_user(
            db=db,
            identifier=login_in.username,
            password=login_in.password,
        )
    except HTTPException as exc:
        if exc.status_code == status.HTTP_401_UNAUTHORIZED:
            login_failure_limiter.record_failure(request, normalized_identifier)
            logger.warning(
                "Security event: Failed login attempt for identifier=%s from ip=%s",
                normalized_identifier,
                client_ip,
            )
        raise exc
    except Exception as exc:
        # Do not convert unexpected database or server errors into login failures
        raise exc

    # 3. Reset failure state upon successful authentication
    login_failure_limiter.reset_failures(request, normalized_identifier)
    logger.info(
        "Security event: Successful login for user_id=%s from ip=%s",
        user.id,
        client_ip,
    )

    # 4. Issue cryptographically signed JWT in httpOnly cookie
    access_token = create_access_token(subject=user.id)

    response.set_cookie(
        key=settings.AUTH_COOKIE_NAME,
        value=access_token,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        max_age=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        path="/",
    )

    return UserResponse.model_validate(user)


@router.post(
    "/logout",
    status_code=status.HTTP_200_OK,
    summary="Admin logout",
    description="Invalidate session by clearing the httpOnly authentication cookie.",
)
def logout(response: Response, request: Request) -> dict:
    """Clear the session cookie and log event."""
    client_ip = get_client_ip(request)
    logger.info("Security event: Admin logout from ip=%s", client_ip)

    response.delete_cookie(
        key=settings.AUTH_COOKIE_NAME,
        httponly=True,
        secure=settings.COOKIE_SECURE,
        samesite=settings.COOKIE_SAMESITE,
        path="/",
    )
    return {"status": "ok", "message": "Successfully logged out."}



@router.get(
    "/me",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Current authenticated user",
    description="Retrieve account info for the currently authenticated administrator.",
)
def get_current_user_info(
    current_user: User = Depends(get_current_active_user),
) -> UserResponse:
    """Return user data for the active authenticated session."""
    return UserResponse.model_validate(current_user)
