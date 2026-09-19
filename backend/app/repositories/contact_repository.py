from typing import List, Optional, Tuple
from sqlalchemy import func, select
from sqlalchemy.orm import Session
from app.models.contact_message import ContactMessage


class ContactRepository:
    """Repository managing ContactMessage database operations via SQLAlchemy 2.x."""

    def create(self, db: Session, message: ContactMessage) -> ContactMessage:
        """Persist a new contact message."""
        db.add(message)
        db.commit()
        db.refresh(message)
        return message

    def list_messages(
        self, db: Session, *, skip: int = 0, limit: int = 50
    ) -> Tuple[List[ContactMessage], int]:
        """List contact messages ordered newest first."""
        count_stmt = select(func.count(ContactMessage.id))
        total = db.scalar(count_stmt) or 0

        stmt = (
            select(ContactMessage)
            .order_by(ContactMessage.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        items = list(db.scalars(stmt).all())
        return items, total

    def get_by_id(self, db: Session, message_id: int) -> Optional[ContactMessage]:
        """Fetch a single contact message by ID."""
        return db.scalar(select(ContactMessage).where(ContactMessage.id == message_id))

    def count_unread(self, db: Session) -> int:
        """Count unread contact messages."""
        stmt = select(func.count(ContactMessage.id)).where(ContactMessage.is_read.is_(False))
        return db.scalar(stmt) or 0

    def mark_as_read(self, db: Session, message_id: int) -> Optional[ContactMessage]:
        """Mark a message as read."""
        msg = self.get_by_id(db, message_id)
        if msg:
            msg.is_read = True
            db.commit()
            db.refresh(msg)
        return msg

    def delete(self, db: Session, message: ContactMessage) -> None:
        """Permanently delete a ContactMessage instance."""
        db.delete(message)
        db.commit()


contact_repository = ContactRepository()
