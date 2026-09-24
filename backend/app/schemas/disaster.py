"""
Pydantic Schemas: Disaster
"""
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class DisasterBase(BaseModel):
    title: str
    type: str
    severity: str
    region: str
    state: str
    latitude: float
    longitude: float

class DisasterCreate(DisasterBase):
    description: Optional[str] = None
    radius_km: Optional[float] = 10.0

class DisasterResponse(DisasterBase):
    id: str
    is_active: bool
    started_at: datetime
    created_at: datetime

    class Config:
        from_attributes = True
