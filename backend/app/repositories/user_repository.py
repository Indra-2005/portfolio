from typing import Optional
from sqlalchemy import or_, select
from sqlalchemy.orm import Session
from app.models.user import User


class UserRepository:
    """Data access repository for User entities."""

    def get_by_id(self, db: Session, user_id: int) -> Optional[User]:
        """Retrieve user by primary key ID."""
        statement = select(User).where(User.id == user_id)
        return db.scalars(statement).first()

    def get_by_username(self, db: Session, username: str) -> Optional[User]:
        """Retrieve user by unique username (case-insensitive)."""
        statement = select(User).where(User.username.ilike(username.strip()))
        return db.scalars(statement).first()

    def get_by_email(self, db: Session, email: str) -> Optional[User]:
        """Retrieve user by unique email address (case-insensitive)."""
        statement = select(User).where(User.email.ilike(email.strip()))
        return db.scalars(statement).first()

    def get_by_username_or_email(self, db: Session, identifier: str) -> Optional[User]:
        """Retrieve user by matching either username or email."""
        clean_id = identifier.strip()
        statement = select(User).where(
            or_(User.username.ilike(clean_id), User.email.ilike(clean_id))
        )
        return db.scalars(statement).first()

    def create(self, db: Session, user: User) -> User:
        """Persist a new user instance."""
        db.add(user)
        db.commit()
        db.refresh(user)
        return user


user_repository = UserRepository()
