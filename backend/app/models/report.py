"""
SQLAlchemy Model: CommunityReport
"""
import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Boolean, Float, DateTime, Text, Integer, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class ReportType(str, enum.Enum):
    flood = "flood"
    cyclone_damage = "cyclone_damage"
    building_damage = "building_damage"
    road_blockage = "road_blockage"
    oil_spill = "oil_spill"
    marine_animal = "marine_animal"
    missing_person = "missing_person"

class ReportStatus(str, enum.Enum):
    pending = "pending"
    verified = "verified"
    rejected = "rejected"
    resolved = "resolved"

class CommunityReport(Base):
    __tablename__ = "community_reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str | None] = mapped_column(String(36), ForeignKey("users.id"), nullable=True)
    report_type: Mapped[ReportType] = mapped_column(SAEnum(ReportType), nullable=False)
    description: Mapped[str] = mapped_column(Text, nullable=False)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    address: Mapped[str | None] = mapped_column(String(300), nullable=True)
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    ai_verified: Mapped[bool] = mapped_column(Boolean, default=False)
    ai_confidence: Mapped[float | None] = mapped_column(Float, nullable=True)
    ai_flood_detected: Mapped[bool | None] = mapped_column(Boolean, nullable=True)
    ai_water_level_m: Mapped[float | None] = mapped_column(Float, nullable=True)
    is_fake: Mapped[bool] = mapped_column(Boolean, default=False)
    urgency_rank: Mapped[int] = mapped_column(Integer, default=5)
    status: Mapped[ReportStatus] = mapped_column(SAEnum(ReportStatus), default=ReportStatus.pending)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
