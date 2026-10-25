"""
FastAPI Router: Disasters & Alerts
"""
from fastapi import APIRouter
from datetime import datetime

router = APIRouter(prefix="/api/disasters", tags=["Disasters"])

@router.get("")
@router.get("/live")
def get_live_disasters():
    return {
        "status": "success",
        "active_alerts": 15,
        "coastal_hazard_index": 6.4,
        "hazard_status": "MODERATE_COASTAL_SURGE_ADVISORY",
        "disasters": [
            {"region": "Maharashtra Coast", "type": "Cyclone", "risk": "Severe Danger", "level": "red", "lat": 16.7, "lng": 73.3, "advisory": "Fishermen advised not to venture into deep sea"},
            {"region": "Kerala & Goa", "type": "High Waves", "risk": "High Risk", "level": "orange", "lat": 9.9, "lng": 76.3, "advisory": "Rough sea conditions with swell heights up to 3.8m"},
            {"region": "Karnataka", "type": "Heavy Rainfall", "risk": "Moderate Risk", "level": "yellow", "lat": 13.1, "lng": 74.8, "advisory": "Localized coastal waterlogging in low-lying sectors"},
            {"region": "Tamil Nadu", "type": "Tsunami", "risk": "Safe", "level": "green", "lat": 13.0, "lng": 80.2, "advisory": "Seismic ocean activity normal, green swim flags active"}
        ],
        "weather": {
            "temperature": "28.4°C",
            "wind_speed": "72 km/h (38.8 kt)",
            "wave_height": "4.2 m",
            "humidity": "89%",
            "visibility": "2.1 km",
            "pressure": "1008 hPa",
            "swell_period": "9.4 s",
            "sea_state": "Rough / Force 6 Beaufort"
        },
        "buoy_telemetry": [
            {"id": "B-04", "name": "Offshore Mumbai Trench", "lat": 18.82, "lng": 72.65, "wave": "3.8m", "temp": "27.8°C", "status": "warning"},
            {"id": "B-09", "name": "Ratnagiri Deep Mooring", "lat": 16.98, "lng": 73.12, "wave": "4.2m", "temp": "28.1°C", "status": "critical"},
            {"id": "B-12", "name": "Goa Shelf Array", "lat": 15.35, "lng": 73.68, "wave": "2.4m", "temp": "28.9°C", "status": "nominal"}
        ],
        "timestamp": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")
    }

