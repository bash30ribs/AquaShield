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


@app.get("/api/health")
def health_check():
    return {"status": "online", "system": settings.app_name, "version": settings.app_version}

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
