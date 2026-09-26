"""
SQLAlchemy Model: ConversationalComplaint
Stores raw citizen incident complaints, multi-turn dialogue, and AI-structured dossiers
for real-time dispatch and future NLP/ML fine-tuning.
"""
import uuid
from datetime import datetime
from sqlalchemy import String, Text, Integer, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class ConversationalComplaint(Base):
    __tablename__ = "conversational_complaints"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    session_id: Mapped[str] = mapped_column(String(100), index=True)
    user_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    raw_user_text: Mapped[str] = mapped_column(Text, nullable=False)
    dialogue_history: Mapped[str | None] = mapped_column(Text, nullable=True)
    extracted_hazard_type: Mapped[str | None] = mapped_column(String(50), nullable=True)
    extracted_title: Mapped[str | None] = mapped_column(String(200), nullable=True)
    professional_description: Mapped[str | None] = mapped_column(Text, nullable=True)
    extracted_location: Mapped[str | None] = mapped_column(String(300), nullable=True)
    extracted_urgency: Mapped[int] = mapped_column(Integer, default=5)
    filed_report_id: Mapped[str | None] = mapped_column(String(36), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="draft")
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
