"""
FastAPI Router: Emergency Broadcast Gateway (WebSockets & REST)
Handles real-time bi-directional alert broadcasting across online devices,
and receives P2P mesh sync payloads from offline nodes.
"""
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Form
from typing import List
import json
from datetime import datetime

router = APIRouter(prefix="/api/alerts", tags=["Emergency Broadcast"])

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

# In-memory store for active broadcasted alerts
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

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    # Send history to newly connected node
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
                payload["id"] = f"alert-{len(BROADCAST_HISTORY)+1:03d}"
                BROADCAST_HISTORY.append(payload)
                await manager.broadcast({
                    "event": "new_alert",
                    "alert": payload
                })
            except Exception as e:
                print(f"Error processing WS payload: {e}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@router.post("/broadcast")
async def create_broadcast_alert(
    alert_type: str = Form("Flood"),
    message: str = Form("Extreme coastal flooding reported. Water rising 1.5m."),
    sender: str = Form("Citizen Reporter"),
    location: str = Form("Coastal Zone"),
    severity: str = Form("CRITICAL"),
    mode: str = Form("Online")
):
    alert_event = {
        "id": f"alert-{len(BROADCAST_HISTORY)+1:03d}",
        "type": alert_type,
        "message": message,
        "sender": sender,
        "location": location,
        "severity": severity,
        "timestamp": datetime.utcnow().strftime("%H:%M:%S UTC"),
        "origin_mode": mode
    }
    BROADCAST_HISTORY.append(alert_event)
    await manager.broadcast({
        "event": "new_alert",
        "alert": alert_event
    })
    return {"status": "broadcasted", "nodes_notified": len(manager.active_connections), "alert": alert_event}

@router.get("/history")
def get_broadcast_history():
    return {"status": "success", "alerts": BROADCAST_HISTORY}
