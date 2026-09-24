"""
FastAPI Router: Disasters & Alerts
"""
from fastapi import APIRouter
from datetime import datetime

router = APIRouter(prefix="/api/disasters", tags=["Disasters"])

@router.get("/live")
def get_live_disasters():
    return {
        "status": "success",
        "active_alerts": 15,
        "disasters": [
            {"region": "Maharashtra Coast", "type": "Cyclone", "risk": "Severe Danger", "level": "red", "lat": 16.7, "lng": 73.3},
            {"region": "Kerala & Goa", "type": "High Waves", "risk": "High Risk", "level": "orange", "lat": 9.9, "lng": 76.3},
            {"region": "Karnataka", "type": "Heavy Rainfall", "risk": "Moderate Risk", "level": "yellow", "lat": 13.1, "lng": 74.8},
            {"region": "Tamil Nadu", "type": "Tsunami", "risk": "Safe", "level": "green", "lat": 13.0, "lng": 80.2}
        ],
        "weather": {
            "temperature": "28°C",
            "wind_speed": "72 km/h",
            "wave_height": "4.2 m",
            "humidity": "89%",
            "visibility": "2.1 km",
            "pressure": "1008 hPa"
        }
    }
