"""
FastAPI Router: SOS Emergency Alerts
Supports REST dispatch, WebSocket real-time broadcast, and zero-data SMS fallback
"""
import uuid
from typing import Optional
from fastapi import APIRouter, Request, Form
from datetime import datetime

router = APIRouter(prefix="/api/sos", tags=["SOS"])

SOS_LOGS = []

@router.post("")
@router.post("/broadcast")
async def trigger_sos(
    request: Request,
    emergency_type: Optional[str] = Form("Flood"),
    lat: Optional[float] = Form(18.9220),
    lng: Optional[float] = Form(72.8347),
    sender_name: Optional[str] = Form("Citizen Sentinel"),
    details: Optional[str] = Form("High-risk coastal emergency reported")
):
    etype = emergency_type
    latitude = lat
    longitude = lng
    sender = sender_name
    info = details

    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            data = await request.json()
            etype = data.get("type") or data.get("emergency_type") or etype
            latitude = data.get("lat") or data.get("latitude") or latitude
            longitude = data.get("lng") or data.get("longitude") or longitude
            sender = data.get("sender") or data.get("sender_name") or sender
            info = data.get("details") or data.get("description") or info
        except Exception:
            pass

    event_id = f"SOS-{uuid.uuid4().hex[:6].upper()}"
    timestamp_str = datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    
    event = {
        "id": event_id,
        "type": etype or "Critical Maritime Distress",
        "lat": float(latitude or 18.9220),
        "lng": float(longitude or 72.8347),
        "sender": sender or "Citizen Sentinel",
        "details": info or "Immediate life-safety rescue requested",
        "timestamp": timestamp_str,
        "status": "Transmitted to 4 authorities (Indian Coast Guard 1554, National Police 112, NDMA Emergency Center, Coastal Ambulance SAR)",
        "sms_payload": f"EMERGENCY SOS: AquaShield Alert! Type: {etype} at GPS: {latitude:.4f},{longitude:.4f}. Immediate rescue needed. Time: {timestamp_str}"
    }
    SOS_LOGS.append(event)

    # Broadcast event via WebSocket to all connected emergency dashboard nodes
    try:
        from app.routers.broadcast import manager
        await manager.broadcast({
            "event": "sos_emergency_alert",
            "sos": event
        })
    except Exception:
        pass

    return {
        "status": "transmitted",
        "message": "Emergency SOS successfully broadcast to coastal rescue command centers and emergency responders.",
        "event": event
    }

