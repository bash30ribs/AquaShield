"""
SQLAlchemy Model: Disaster
"""
import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Boolean, Float, DateTime, Text, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class DisasterType(str, enum.Enum):
    cyclone = "cyclone"
    flood = "flood"
    tsunami = "tsunami"
    storm_surge = "storm_surge"
    high_tide = "high_tide"
    oil_spill = "oil_spill"
    rainfall = "rainfall"

class SeverityLevel(str, enum.Enum):
    safe = "safe"
    moderate = "moderate"
    high = "high"
    severe = "severe"

class Disaster(Base):
    __tablename__ = "disasters"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    type: Mapped[DisasterType] = mapped_column(SAEnum(DisasterType), nullable=False)
    severity: Mapped[SeverityLevel] = mapped_column(SAEnum(SeverityLevel), nullable=False)
    title: Mapped[str] = mapped_column(String(200), nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    region: Mapped[str] = mapped_column(String(150), nullable=False)
    state: Mapped[str] = mapped_column(String(100), nullable=False)
    radius_km: Mapped[float] = mapped_column(Float, default=10.0)
    source: Mapped[str | None] = mapped_column(String(100), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    started_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
