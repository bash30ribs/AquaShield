"""
FastAPI Router: Marine Animal Rescue
"""
from fastapi import APIRouter, Form

router = APIRouter(prefix="/api/marine", tags=["Marine Rescue"])

@router.post("/rescue")
def report_marine_rescue(species: str = Form("Turtle"), severity: str = Form("Moderate"), location: str = Form("Vizag Beach")):
    return {
        "status": "success",
        "message": f"Alert sent to nearest marine NGO for {species} rescue at {location}.",
        "ngo_assigned": "Sea Turtle Conservation Foundation",
        "eta": "15 minutes"
    }


@router.get("")
def get_marine_status():
    """Returns marine animal rescue operations summary and NGO contacts."""
    return {
        "status": "success",
        "active_rescues": 2,
        "operations": [
            {
                "id": "MAR-001",
                "species": "Olive Ridley Turtle",
                "location": "Versova North Beach",
                "status": "Team Deployed",
                "ngo": "Sea Turtle Conservation Foundation",
                "severity": "Moderate"
            },
            {
                "id": "MAR-002",
                "species": "Bottlenose Dolphin",
                "location": "Juhu Beach Intertidal Zone",
                "status": "Under Observation",
                "ngo": "Wildlife SOS Marine Wing",
                "severity": "Low"
            }
        ],
        "ngo_contacts": {
            "marine_rescue": "+91-98202-88120",
            "wwf_india": "+91-11-4150-4814",
            "coast_guard_env_wing": "1554"
        }
    }
