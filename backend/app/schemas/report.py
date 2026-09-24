"""
Pydantic Schemas: Community Report
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ReportCreate(BaseModel):
    report_type: str
    description: str
    latitude: float
    longitude: float
    address: Optional[str] = None

class ReportResponse(ReportCreate):
    id: str
    ai_verified: bool
    ai_confidence: Optional[float] = None
    ai_flood_detected: Optional[bool] = None
    is_fake: bool
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
