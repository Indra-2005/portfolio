from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_active_user
from app.core.config import settings
from app.core.database import get_db
from app.core.security import create_access_token
from app.models.user import User
from app.schemas.user import LoginRequest, UserResponse
from app.services.auth_service import auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/login",
    response_model=UserResponse,
    status_code=status.HTTP_200_OK,
    summary="Admin login",
    description="Authenticate credentials and set a secure httpOnly session cookie.",
)
def login(
    login_in: LoginRequest,
    response: Response,
    db: Session = Depends(get_db),
) -> UserResponse:
    """
    Authenticate administrator and establish httpOnly session cookie.
    Never stores or returns tokens in localStorage.
    """
    user = auth_service.authenticate_user(
        db=db,
        identifier=login_in.username,
        password=login_in.password,
    )

    access_token = create_access_token(subject=user.id)

    # Set secure httpOnly cookie
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
def logout(response: Response) -> dict:
    """Clear the session cookie."""
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
