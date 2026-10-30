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
    admin_router,
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
app.include_router(admin_router)

# ── Mobile Vision Threat Scanner Endpoint ───────────────────────────────────
import base64
from app.services.ai_service import AIService

@app.post("/api/threat-scan")
async def threat_scan_mobile(request: Request):
    """Mobile app endpoint for forensic vision assessment."""
    img_b64 = None
    try:
        body = await request.json()
        img_b64 = body.get("image") or body.get("image_base64")
    except Exception:
        pass

    if img_b64:
        try:
            # Strip header if present
            if "," in img_b64:
                img_b64 = img_b64.split(",", 1)[1]
            img_bytes = base64.b64decode(img_b64)
            analysis = AIService.analyze_image_bytes(img_bytes, filename="mobile_capture.jpg")
        except Exception:
            analysis = AIService.analyze_disaster_image("mobile_scan")
    else:
        analysis = AIService.analyze_disaster_image("mobile_scan")

    is_verified = (analysis.get("status") == "verified")
    hazard = analysis.get("detected_hazard") or "Surface Hazard / Debris"
    conf = float(analysis.get("authenticity_score", 92.0)) / 100.0

    actions_list = [
        "Notify Maritime Patrol Sector",
        "Deploy containment boom down-drift" if "oil" in hazard.lower() else "Dispatch coastal response cutter",
        "Broadcast warning alert to nearby vessels"
    ]
    return {
        "class": hazard.replace("_", " ").title(),
        "threatClass": hazard.replace("_", " ").title(),
        "confidence": conf,
        "severity": "High" if is_verified else "Moderate",
        "description": analysis.get("verdict_description") or "Automated dual-stream forensic analysis complete.",
        "actions": actions_list,
        "recommendedActions": actions_list,
        "forensic_details": analysis
    }



@app.get("/health")
@app.get("/api/health")
def health_check():
    return {"status": "operational", "system": settings.app_name, "version": settings.app_version}

# ── Canonical Alias Routes ────────────────────────────────────────────────────
# /api/broadcast → delegate to DB-backed /api/alerts/broadcast
from fastapi import Form as _Form, Request as _AliasRequest, Depends as _Depends
from app.database import get_db as _get_db
from sqlalchemy.ext.asyncio import AsyncSession as _AsyncSession
from datetime import datetime as _dt, timezone as _tz

@app.post("/api/broadcast")
async def alias_broadcast(request: _AliasRequest, db: _AsyncSession = _Depends(_get_db)):
    """Canonical alias → fully delegates to DB-backed broadcast router."""
    from app.routers.broadcast import create_broadcast_alert
    return await create_broadcast_alert(request=request, db=db)

@app.get("/api/broadcast")
async def alias_broadcast_history(db: _AsyncSession = _Depends(_get_db)):
    """Return broadcast history from DB."""
    from app.routers.broadcast import get_broadcast_history
    return await get_broadcast_history(db=db)

# /api/sms → stateless SMS payload generator (no DB needed by design)
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
    {"name": "Coast Guard",       "number": "+911554"},
    {"name": "Police Emergency",  "number": "+91100"},
    {"name": "Ambulance",         "number": "+91108"},
    {"name": "Disaster Helpline", "number": "+911070"},
]

@app.post("/api/sms")
def alias_sms(payload: _SMSPayload):
    """Canonical shortcut → SMS-ready payload with pre-formatted body."""
    timestamp = _dt.now(_tz.utc).strftime("%Y-%m-%d %H:%M UTC")
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
                "name":    c["name"],
                "number":  c["number"],
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
