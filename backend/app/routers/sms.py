"""
FastAPI Router: SMS Emergency Gateway
Sends SOS alerts via SMS when internet is unavailable.
Uses native device SMS (sms: URI) as primary, with Twilio API as optional backend.
"""
from fastapi import APIRouter, Form
from datetime import datetime

router = APIRouter(prefix="/api/sms", tags=["SMS Emergency"])

# Pre-configured emergency contacts
EMERGENCY_CONTACTS = [
    {"name": "NDMA Control Room", "number": "+911078"},
    {"name": "Coast Guard", "number": "+911554"},
    {"name": "Police Emergency", "number": "+91100"},
    {"name": "Ambulance", "number": "+91108"},
    {"name": "Disaster Helpline", "number": "+911070"},
]

@router.post("/send-sos")
def send_sms_sos(
    emergency_type: str = Form("Flood"),
    lat: float = Form(17.6868),
    lng: float = Form(83.2185),
    message: str = Form("")
):
    """
    Generates SMS-ready payload for emergency alerts.
    In production, this would integrate with Twilio/MSG91/TextLocal API.
    For demo, it returns the pre-formatted SMS body and emergency numbers.
    """
    timestamp = datetime.utcnow().strftime("%Y-%m-%d %H:%M UTC")
    
    sms_body = (
        f"SOS EMERGENCY ALERT - AquaShield AI\n"
        f"Type: {emergency_type}\n"
        f"Location: {lat}, {lng}\n"
        f"Google Maps: https://maps.google.com/?q={lat},{lng}\n"
        f"Time: {timestamp}\n"
        f"{'Message: ' + message if message else ''}\n"
        f"PLEASE SEND IMMEDIATE HELP"
    )
    
    return {
        "status": "sms_ready",
        "sms_body": sms_body,
        "emergency_contacts": EMERGENCY_CONTACTS,
        "sms_links": [
            {
                "name": c["name"],
                "number": c["number"],
                "sms_uri": f"sms:{c['number']}?body={sms_body.replace(' ', '%20').replace(chr(10), '%0A')}"
            }
            for c in EMERGENCY_CONTACTS
        ],
        "instructions": "If no internet, use the sms: links to send emergency SMS directly from your phone."
    }

@router.get("/emergency-contacts")
def get_emergency_contacts():
    return {"contacts": EMERGENCY_CONTACTS}
