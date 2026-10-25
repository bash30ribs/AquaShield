"""
FastAPI Router: Emergency Broadcast Gateway (WebSockets & REST)
All REST broadcasts are now persisted to the broadcast_alerts DB table.
WebSocket history is still kept in-memory for fast delivery; DB is the durable source.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends, Request
from sqlalchemy import select, desc
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
import uuid
import json
from datetime import datetime

from app.database import get_db
from app.models.broadcast_alert import BroadcastAlert

router = APIRouter(prefix="/api/alerts", tags=["Emergency Broadcast"])


# ── WebSocket Connection Manager ─────────────────────────────────────────────
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"📡 New emergency mesh node connected. Total nodes: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f"📡 Node disconnected. Total nodes: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        payload = json.dumps(message)
        disconnected = []
        for connection in self.active_connections:
            try:
                await connection.send_text(payload)
            except Exception:
                disconnected.append(connection)
        for conn in disconnected:
            self.disconnect(conn)


manager = ConnectionManager()

# In-memory cache for fast WS history delivery (populated from DB on request)
BROADCAST_HISTORY: List[dict] = [
    {
        "id": "alert-init-01",
        "type": "Cyclone Warning",
        "message": "RED ALERT: Cyclone Biparjoy approaching Maharashtra coast. Wind speed 95 km/h. Evacuate to high ground immediately.",
        "sender": "NDMA Authority",
        "location": "Ratnagiri & South Konkan",
        "severity": "CRITICAL",
        "timestamp": datetime.utcnow().strftime("%H:%M:%S UTC"),
        "origin_mode": "Online Server Broadcast"
    }
]


def _row_to_dict(alert: BroadcastAlert) -> dict:
    return {
        "id":          alert.id,
        "type":        alert.alert_type,
        "message":     alert.message,
        "sender":      alert.sender,
        "location":    alert.location,
        "severity":    alert.severity,
        "timestamp":   alert.created_at.strftime("%H:%M:%S UTC") if alert.created_at else "",
        "origin_mode": alert.origin_mode,
    }


# ── WebSocket Endpoint ────────────────────────────────────────────────────────
@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        await websocket.send_text(json.dumps({
            "event": "history_sync",
            "alerts": BROADCAST_HISTORY
        }))
        while True:
            data = await websocket.receive_text()
            try:
                payload = json.loads(data)
                payload["timestamp"] = datetime.utcnow().strftime("%H:%M:%S UTC")
                payload["id"] = f"alert-ws-{uuid.uuid4().hex[:6]}"
                BROADCAST_HISTORY.append(payload)
                await manager.broadcast({"event": "new_alert", "alert": payload})
            except Exception as e:
                print(f"Error processing WS payload: {e}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)


# ── REST Broadcast (persists to DB) ──────────────────────────────────────────
@router.post("/broadcast")
async def create_broadcast_alert(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    """Accept JSON or form data, persist to DB, and broadcast via WebSocket."""
    alert_type = "Flood"
    message    = "Emergency alert"
    sender     = "Citizen"
    location   = "Coastal Zone"
    severity   = "CRITICAL"
    mode       = "Online"

    content_type = getattr(request, "headers", {}).get("content-type", "")
    if "application/json" in content_type:
        try:
            body      = await request.json()
            alert_type = body.get("alert_type") or body.get("type") or alert_type
            message    = body.get("message") or message
            sender     = body.get("sender") or sender
            location   = body.get("location") or location
            severity   = body.get("severity") or severity
            mode       = body.get("mode") or mode
        except Exception:
            pass
    elif "form" in content_type:
        try:
            form       = await request.form()
            alert_type = form.get("alert_type") or alert_type
            message    = form.get("message") or message
            sender     = form.get("sender") or sender
            location   = form.get("location") or location
            severity   = form.get("severity") or severity
            mode       = form.get("mode") or mode
        except Exception:
            pass

    # ── Persist to database ─────────────────────────────────────────────────
    db_alert = BroadcastAlert(
        id          = f"ALERT-{uuid.uuid4().hex[:8].upper()}",
        alert_type  = alert_type,
        message     = message,
        sender      = sender,
        location    = location,
        severity    = severity,
        origin_mode = mode,
        created_at  = datetime.utcnow(),
    )
    db.add(db_alert)
    await db.commit()
    await db.refresh(db_alert)

    alert_dict = _row_to_dict(db_alert)
    BROADCAST_HISTORY.append(alert_dict)
    await manager.broadcast({"event": "new_alert", "alert": alert_dict})

    return {
        "status":         "broadcasted",
        "nodes_notified": len(manager.active_connections),
        "alert":          alert_dict,
    }


# ── GET history from DB ────────────────────────────────────────────────────────
@router.get("/history")
async def get_broadcast_history(
    limit: int = 100,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(BroadcastAlert).order_by(desc(BroadcastAlert.created_at)).limit(limit)
    )
    alerts = result.scalars().all()
    return {"status": "success", "total": len(alerts), "alerts": [_row_to_dict(a) for a in alerts]}
