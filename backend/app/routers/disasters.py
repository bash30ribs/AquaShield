"""
FastAPI Router: Disasters & Alerts
Live disaster alerts now read from AND write to the disasters DB table.
Seeded on first boot; new disasters can be submitted via POST.
"""
import uuid
from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.disaster import Disaster, DisasterType, SeverityLevel

router = APIRouter(prefix="/api/disasters", tags=["Disasters"])

# Static weather & buoy telemetry (sensor feed: not stored in DB)
_WEATHER = {
    "temperature":  "28.4°C",
    "wind_speed":   "72 km/h (38.8 kt)",
    "wave_height":  "4.2 m",
    "humidity":     "89%",
    "visibility":   "2.1 km",
    "pressure":     "1008 hPa",
    "swell_period": "9.4 s",
    "sea_state":    "Rough / Force 6 Beaufort",
}
_BUOYS = [
    {"id": "B-04", "name": "Offshore Mumbai Trench",   "lat": 18.82, "lng": 72.65, "wave": "3.8m", "temp": "27.8°C", "status": "warning"},
    {"id": "B-09", "name": "Ratnagiri Deep Mooring",   "lat": 16.98, "lng": 73.12, "wave": "4.2m", "temp": "28.1°C", "status": "critical"},
    {"id": "B-12", "name": "Goa Shelf Array",           "lat": 15.35, "lng": 73.68, "wave": "2.4m", "temp": "28.9°C", "status": "nominal"},
]

_SEVERITY_LABEL = {
    "severe":   "Severe Danger",
    "high":     "High Risk",
    "moderate": "Moderate Risk",
    "safe":     "Safe",
}
_LEVEL_MAP = {
    "severe":   "red",
    "high":     "orange",
    "moderate": "yellow",
    "safe":     "green",
}


def _row_to_dict(d: Disaster) -> dict:
    return {
        "id":          d.id,
        "region":      d.region,
        "type":        d.type.value.replace("_", " ").title(),
        "risk":        _SEVERITY_LABEL.get(d.severity.value, d.severity.value),
        "level":       _LEVEL_MAP.get(d.severity.value, "yellow"),
        "lat":         d.latitude,
        "lng":         d.longitude,
        "advisory":    d.description or "",
        "state":       d.state,
        "is_active":   d.is_active,
        "started_at":  d.started_at.strftime("%Y-%m-%d %H:%M UTC") if d.started_at else "",
        "created_at":  d.created_at.strftime("%Y-%m-%d %H:%M UTC") if d.created_at else "",
    }


@router.get("")
@router.get("/live")
async def get_live_disasters(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Disaster).where(Disaster.is_active == True).order_by(desc(Disaster.created_at))
    )
    disasters = result.scalars().all()

    return {
        "status":               "success",
        "active_alerts":        len(disasters),
        "coastal_hazard_index": round(sum(
            {"severe": 9, "high": 7, "moderate": 5, "safe": 1}.get(d.severity.value, 5)
            for d in disasters
        ) / max(len(disasters), 1), 1),
        "hazard_status":        "MODERATE_COASTAL_SURGE_ADVISORY",
        "disasters":            [_row_to_dict(d) for d in disasters],
        "weather":              _WEATHER,
        "buoy_telemetry":       _BUOYS,
        "timestamp":            datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC"),
    }


@router.get("/{disaster_id}")
async def get_disaster(disaster_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Disaster).where(Disaster.id == disaster_id))
    d = result.scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=404, detail="Disaster not found")
    return {"status": "success", "disaster": _row_to_dict(d)}


class DisasterCreateRequest(BaseModel):
    type:        str = "flood"
    severity:    str = "moderate"
    title:       str
    description: Optional[str] = None
    latitude:    float
    longitude:   float
    region:      str
    state:       str = "Maharashtra"
    radius_km:   float = 10.0
    source:      Optional[str] = "Citizen Report"


@router.post("")
async def create_disaster(req: DisasterCreateRequest, db: AsyncSession = Depends(get_db)):
    """Submit a new disaster event: persisted to the disasters table."""
    try:
        dtype    = DisasterType(req.type.lower().replace(" ", "_"))
        severity = SeverityLevel(req.severity.lower())
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))

    d = Disaster(
        id          = str(uuid.uuid4()),
        type        = dtype,
        severity    = severity,
        title       = req.title,
        description = req.description,
        latitude    = req.latitude,
        longitude   = req.longitude,
        region      = req.region,
        state       = req.state,
        radius_km   = req.radius_km,
        source      = req.source,
        is_active   = True,
        started_at  = datetime.utcnow(),
        created_at  = datetime.utcnow(),
    )
    db.add(d)
    await db.commit()
    await db.refresh(d)
    return {"status": "created", "disaster": _row_to_dict(d)}


@router.delete("/{disaster_id}")
async def deactivate_disaster(disaster_id: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Disaster).where(Disaster.id == disaster_id))
    d = result.scalar_one_or_none()
    if not d:
        raise HTTPException(status_code=404, detail="Disaster not found")
    d.is_active = False
    await db.commit()
    return {"status": "deactivated", "id": disaster_id}
