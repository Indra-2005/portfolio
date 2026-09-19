from typing import List, Tuple
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from app.models.contact_message import ContactMessage
from app.repositories.contact_repository import ContactRepository, contact_repository
from app.schemas.contact import ContactMessageCreate


class ContactService:
    """Business logic service for contact message inquiries."""

    def __init__(self, repo: ContactRepository = contact_repository) -> None:
        self.repo = repo

    def process_message(
        self, db: Session, message_in: ContactMessageCreate
    ) -> ContactMessage:
        """
        Validate, inspect spam traps, and persist contact message.
        """
        # Honeypot spam defense: bots populate invisible fields
        if message_in.honeypot and message_in.honeypot.strip():
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Spam submission detected.",
            )

        message = ContactMessage(
            name=message_in.name,
            email=str(message_in.email),
            subject=message_in.subject,
            message=message_in.message,
        )
        return self.repo.create(db, message)

    def list_messages(
        self, db: Session, *, page: int = 1, page_size: int = 50
    ) -> Tuple[List[ContactMessage], int]:
        """List messages for admin dashboard."""
        skip = (page - 1) * page_size
        return self.repo.list_messages(db, skip=skip, limit=page_size)

    def get_unread_count(self, db: Session) -> int:
        """Get total unread messages count."""
        return self.repo.count_unread(db)

    def mark_as_read(self, db: Session, message_id: int) -> ContactMessage:
        """Mark a message as read."""
        msg = self.repo.mark_as_read(db, message_id)
        if not msg:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Message with ID {message_id} was not found.",
            )
        return msg

    def get_message_by_id(self, db: Session, message_id: int) -> ContactMessage:
        """Fetch a single message by ID or raise 404."""
        msg = self.repo.get_by_id(db, message_id)
        if not msg:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Message with ID {message_id} was not found.",
            )
        return msg

    def delete_message(self, db: Session, message_id: int) -> None:
        """Permanently delete a contact message by ID."""
        msg = self.get_message_by_id(db, message_id)
        self.repo.delete(db, msg)


contact_service = ContactService()
