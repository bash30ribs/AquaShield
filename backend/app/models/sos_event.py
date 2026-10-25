"""
SQLAlchemy Model: SOSEvent
Persists every emergency SOS distress call to SQLite/PostgreSQL.
"""
import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Float, DateTime, Text, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class SOSStatus(str, enum.Enum):
    transmitted   = "transmitted"
    acknowledged  = "acknowledged"
    dispatched    = "dispatched"
    resolved      = "resolved"


class SOSEvent(Base):
    __tablename__ = "sos_events"

    id:             Mapped[str]          = mapped_column(String(36),  primary_key=True, default=lambda: f"SOS-{uuid.uuid4().hex[:6].upper()}")
    emergency_type: Mapped[str]          = mapped_column(String(80),  nullable=False, default="General")
    latitude:       Mapped[float]        = mapped_column(Float,       nullable=False)
    longitude:      Mapped[float]        = mapped_column(Float,       nullable=False)
    sender_name:    Mapped[str]          = mapped_column(String(120), nullable=False, default="Citizen Sentinel")
    details:        Mapped[str | None]   = mapped_column(Text,        nullable=True)
    sms_payload:    Mapped[str | None]   = mapped_column(Text,        nullable=True)
    status:         Mapped[SOSStatus]    = mapped_column(SAEnum(SOSStatus), default=SOSStatus.transmitted)
    created_at:     Mapped[datetime]     = mapped_column(DateTime,    default=datetime.utcnow)
