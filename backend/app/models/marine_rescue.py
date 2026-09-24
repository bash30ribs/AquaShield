"""
SQLAlchemy Model: MarineRescue
"""
import uuid
import enum
from datetime import datetime
from sqlalchemy import String, Float, DateTime, Text, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base

class Species(str, enum.Enum):
    turtle = "turtle"
    dolphin = "dolphin"
    whale = "whale"
    fish = "fish"
    bird = "bird"
    seal = "seal"

class RescueStatus(str, enum.Enum):
    reported = "reported"
    ngo_alerted = "ngo_alerted"
    in_rescue = "in_rescue"
    rescued = "rescued"

class MarineRescue(Base):
    __tablename__ = "marine_rescues"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    species: Mapped[Species] = mapped_column(SAEnum(Species), nullable=False)
    species_detail: Mapped[str | None] = mapped_column(String(100), nullable=True)
    injury_severity: Mapped[str] = mapped_column(String(50), default="Moderate")
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(Text, nullable=True)
    latitude: Mapped[float] = mapped_column(Float, nullable=False)
    longitude: Mapped[float] = mapped_column(Float, nullable=False)
    beach_name: Mapped[str | None] = mapped_column(String(200), nullable=True)
    ngo_assigned: Mapped[str | None] = mapped_column(String(200), nullable=True)
    status: Mapped[RescueStatus] = mapped_column(SAEnum(RescueStatus), default=RescueStatus.reported)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
