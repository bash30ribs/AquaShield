"""
SQLAlchemy Model: BroadcastAlert
Persists every emergency broadcast alert to SQLite/PostgreSQL.
Complements the in-memory WebSocket history with durable storage.
"""
import uuid
from datetime import datetime
from sqlalchemy import String, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class BroadcastAlert(Base):
    __tablename__ = "broadcast_alerts"

    id:          Mapped[str]        = mapped_column(String(36),  primary_key=True, default=lambda: f"ALERT-{uuid.uuid4().hex[:8].upper()}")
    alert_type:  Mapped[str]        = mapped_column(String(80),  nullable=False, default="Flood")
    message:     Mapped[str]        = mapped_column(Text,        nullable=False)
    sender:      Mapped[str]        = mapped_column(String(120), nullable=False, default="Citizen")
    location:    Mapped[str]        = mapped_column(String(200), nullable=False, default="Coastal Zone")
    severity:    Mapped[str]        = mapped_column(String(30),  nullable=False, default="HIGH")
    origin_mode: Mapped[str]        = mapped_column(String(50),  nullable=False, default="Online")
    created_at:  Mapped[datetime]   = mapped_column(DateTime,    default=datetime.utcnow)
