"""
Schemas Package Init
"""
from app.schemas.disaster import DisasterCreate, DisasterResponse
from app.schemas.report import ReportCreate, ReportResponse

__all__ = ["DisasterCreate", "DisasterResponse", "ReportCreate", "ReportResponse"]
