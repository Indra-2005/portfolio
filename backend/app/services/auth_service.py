from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.core.security import hash_password, verify_password
from app.models.user import User
from app.repositories.user_repository import UserRepository, user_repository
from app.schemas.user import UserCreate


class AuthService:
    """Authentication and User business logic service."""

    def __init__(self, repo: UserRepository = user_repository) -> None:
        self.repo = repo

    def authenticate_user(self, db: Session, identifier: str, password: str) -> User:
        """
        Authenticate a user by username or email and password.
        Security Rule: Generic 401 message so existence of account is not leaked.
        """
        user = self.repo.get_by_username_or_email(db, identifier)
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid username or password.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        if not user.is_active:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="User account is inactive.",
            )

        return user

    def create_user(self, db: Session, user_in: UserCreate) -> User:
        """
        Create a new user with bcrypt-hashed password.
        Enforces uniqueness on username and email.
        """
        if self.repo.get_by_username(db, user_in.username):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Username '{user_in.username}' is already taken.",
            )

        if self.repo.get_by_email(db, user_in.email):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Email '{user_in.email}' is already registered.",
            )

        hashed = hash_password(user_in.password)
        user = User(
            username=user_in.username,
            email=user_in.email,
            hashed_password=hashed,
            is_active=user_in.is_active,
        )
        return self.repo.create(db, user)


auth_service = AuthService()
