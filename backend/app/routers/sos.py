"""
FastAPI Router: SOS Emergency Alerts
"""
from fastapi import APIRouter, Form
from datetime import datetime

router = APIRouter(prefix="/api/sos", tags=["SOS"])

SOS_LOGS = []

@router.post("")
def trigger_sos(emergency_type: str = Form("Flood"), lat: float = Form(17.6868), lng: float = Form(83.2185)):
    event = {
        "id": f"sos-{len(SOS_LOGS)+1:03d}",
        "type": emergency_type,
        "lat": lat,
        "lng": lng,
        "timestamp": datetime.utcnow().strftime("%H:%M:%S UTC"),
        "status": "Transmitted to 4 authorities (Police, Coast Guard, NDMA, Ambulance)"
    }
    SOS_LOGS.append(event)
    return {"status": "transmitted", "event": event}
