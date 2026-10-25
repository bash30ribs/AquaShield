"""
AquaShield AI — FastAPI Main Application
"""
import os
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse

from app.config import settings
from app.database import init_db
from app.routers import (
    disasters_router,
    reports_router,
    marine_router,
    routes_router,
    sos_router,
    chat_router,
    sms_router,
    broadcast_router,
    auth_router,
)

@asynccontextmanager
async def lifespan(app: FastAPI):
    await init_db()
    yield

app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    description="AI-Powered Coastal Disaster Intelligence and Marine Safety Platform",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "SAMEORIGIN"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(self)"
        return response

app.add_middleware(SecurityHeadersMiddleware)

# Include All Feature Routers
app.include_router(disasters_router)
app.include_router(reports_router)
app.include_router(marine_router)
app.include_router(routes_router)
app.include_router(sos_router)
app.include_router(chat_router)
app.include_router(sms_router)
app.include_router(broadcast_router)
app.include_router(auth_router)


@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "operational", "system": settings.app_name, "version": settings.app_version}

# ── Canonical Alias Routes ────────────────────────────────────────────────────
# /api/broadcast → /api/alerts/broadcast (REST fallback for mesh broadcast)
from fastapi import Form as _Form, Request as _Request
from app.routers.broadcast import BROADCAST_HISTORY, manager as _broadcast_manager
from datetime import datetime as _dt

@app.post("/api/broadcast")
async def alias_broadcast(
    alert_type: str = _Form("Flood"),
    message: str = _Form("Emergency alert"),
    sender: str = _Form("Citizen"),
    location: str = _Form("Coastal Zone"),
    severity: str = _Form("HIGH"),
    mode: str = _Form("Online"),
):
    """Canonical shortcut → delegates to broadcast router logic."""
    alert_event = {
        "id": f"alert-{len(BROADCAST_HISTORY)+1:03d}",
        "type": alert_type,
        "message": message,
        "sender": sender,
        "location": location,
        "severity": severity,
        "timestamp": _dt.utcnow().strftime("%H:%M:%S UTC"),
        "origin_mode": mode,
    }
    BROADCAST_HISTORY.append(alert_event)
    await _broadcast_manager.broadcast({"event": "new_alert", "alert": alert_event})
    return {"status": "broadcasted", "nodes_notified": len(_broadcast_manager.active_connections), "alert": alert_event}

@app.get("/api/broadcast")
def alias_broadcast_history():
    return {"status": "success", "alerts": BROADCAST_HISTORY}

# /api/sms → /api/sms/send-sos (alias accepting JSON body)
from pydantic import BaseModel as _BaseModel
from typing import Optional as _Optional

class _SMSPayload(_BaseModel):
    to: _Optional[str] = None
    message: str = "Emergency SOS"
    emergency_type: str = "General"
    lat: float = 17.6868
    lng: float = 83.2185

EMERGENCY_CONTACTS_ALIAS = [
    {"name": "NDMA Control Room", "number": "+911078"},
    {"name": "Coast Guard", "number": "+911554"},
    {"name": "Police Emergency", "number": "+91100"},
    {"name": "Ambulance", "number": "+91108"},
    {"name": "Disaster Helpline", "number": "+911070"},
]

@app.post("/api/sms")
def alias_sms(payload: _SMSPayload):
    """Canonical shortcut → SMS-ready payload with pre-formatted body."""
    timestamp = _dt.utcnow().strftime("%Y-%m-%d %H:%M UTC")
    sms_body = (
        f"SOS EMERGENCY ALERT - AquaShield AI\n"
        f"Type: {payload.emergency_type}\n"
        f"Location: {payload.lat}, {payload.lng}\n"
        f"Google Maps: https://maps.google.com/?q={payload.lat},{payload.lng}\n"
        f"Time: {timestamp}\n"
        f"Message: {payload.message}\n"
        f"PLEASE SEND IMMEDIATE HELP"
    )
    return {
        "status": "sms_ready",
        "to": payload.to,
        "sms_body": sms_body,
        "emergency_contacts": EMERGENCY_CONTACTS_ALIAS,
        "sms_links": [
            {
                "name": c["name"],
                "number": c["number"],
                "sms_uri": f"sms:{c['number']}?body={sms_body.replace(' ', '%20').replace(chr(10), '%0A')}",
            }
            for c in EMERGENCY_CONTACTS_ALIAS
        ],
    }

# Serve root HTML & Static Assets
from fastapi.staticfiles import StaticFiles
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
assets_dir = os.path.join(ROOT_DIR, "assets")
if os.path.exists(assets_dir):
    app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

@app.get("/")
@app.get("/index.html")
def get_index():
    return FileResponse(os.path.join(ROOT_DIR, "index.html"))

@app.get("/style.css")
def get_css():
    return FileResponse(os.path.join(ROOT_DIR, "style.css"))

@app.get("/app.js")
def get_js():
    return FileResponse(os.path.join(ROOT_DIR, "app.js"))

@app.get("/mesh_broadcast.js")
def get_mesh_js():
    return FileResponse(os.path.join(ROOT_DIR, "mesh_broadcast.js"), media_type="application/javascript")

@app.get("/sw.js")
def get_sw():
    return FileResponse(os.path.join(ROOT_DIR, "sw.js"), media_type="application/javascript")

@app.get("/manifest.json")
def get_manifest():
    return FileResponse(os.path.join(ROOT_DIR, "manifest.json"), media_type="application/json")

@app.get("/sitemap.xml")
def get_sitemap():
    return FileResponse(os.path.join(ROOT_DIR, "sitemap.xml"), media_type="application/xml")

@app.get("/robots.txt")
def get_robots():
    return FileResponse(os.path.join(ROOT_DIR, "robots.txt"), media_type="text/plain")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
