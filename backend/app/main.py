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

# Include All Feature Routers
app.include_router(disasters_router)
app.include_router(reports_router)
app.include_router(marine_router)
app.include_router(routes_router)
app.include_router(sos_router)
app.include_router(chat_router)
app.include_router(sms_router)
app.include_router(broadcast_router)

@app.get("/api/health")
def health_check():
    return {"status": "online", "system": settings.app_name, "version": settings.app_version}

# Serve root HTML & Static Assets
ROOT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

@app.get("/")
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="127.0.0.1", port=8000, reload=True)
