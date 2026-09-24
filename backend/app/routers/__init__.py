"""
Routers Package Init
"""
from app.routers.disasters import router as disasters_router
from app.routers.reports import router as reports_router
from app.routers.marine import router as marine_router
from app.routers.routes import router as routes_router
from app.routers.sos import router as sos_router
from app.routers.chat import router as chat_router
from app.routers.sms import router as sms_router
from app.routers.broadcast import router as broadcast_router

__all__ = [
    "disasters_router",
    "reports_router",
    "marine_router",
    "routes_router",
    "sos_router",
    "chat_router",
    "sms_router",
    "broadcast_router",
]

