"""
FastAPI Router: Admin Operations & System Health Dashboard
Provides consolidated KPIs, database audit logging, and administrative oversight.
Protected under Disallow: /api/admin/ in robots.txt.
"""
import datetime
import os
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select, func, desc
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models.report import CommunityReport, ReportStatus, ReportType
from app.models.sos_event import SOSEvent, SOSStatus
from app.models.disaster import Disaster
from app.models.marine_rescue import MarineRescue
from app.models.broadcast_alert import BroadcastAlert
from app.models.user import User

router = APIRouter(prefix="/api/admin", tags=["Admin Operations"])

START_TIME = datetime.datetime.now(datetime.timezone.utc)

@router.get("/overview")
@router.get("/stats")
async def get_admin_overview(db: AsyncSession = Depends(get_db)):
    """Consolidated KPI overview across all primary database tables."""
    # 1. Reports counts
    rep_total = await db.scalar(select(func.count(CommunityReport.id)))
    rep_verified = await db.scalar(select(func.count(CommunityReport.id)).where(CommunityReport.status == ReportStatus.verified))
    rep_quarantined = await db.scalar(select(func.count(CommunityReport.id)).where(CommunityReport.status == ReportStatus.rejected))
    rep_pending = await db.scalar(select(func.count(CommunityReport.id)).where(CommunityReport.status == ReportStatus.pending))

    # 2. SOS Events counts
    sos_total = await db.scalar(select(func.count(SOSEvent.id)))
    sos_active = await db.scalar(select(func.count(SOSEvent.id)).where(SOSEvent.status == SOSStatus.transmitted))
    sos_dispatched = await db.scalar(select(func.count(SOSEvent.id)).where(SOSEvent.status == SOSStatus.dispatched))
    sos_resolved = await db.scalar(select(func.count(SOSEvent.id)).where(SOSEvent.status == SOSStatus.resolved))

    # 3. Disasters & Marine counts
    disasters_active = await db.scalar(select(func.count(Disaster.id)).where(Disaster.is_active == True))
    marine_total = await db.scalar(select(func.count(MarineRescue.id)))
    broadcasts_total = await db.scalar(select(func.count(BroadcastAlert.id)))
    users_total = await db.scalar(select(func.count(User.id)))

    # 4. System Telemetry & Uptime
    now = datetime.datetime.now(datetime.timezone.utc)
    uptime_seconds = int((now - START_TIME).total_seconds())

    return {
        "status": "operational",
        "system": "AquaShield AI Sentinel Command Hub",
        "uptime_seconds": uptime_seconds,
        "kpi": {
            "reports": {
                "total": rep_total or 0,
                "verified": rep_verified or 0,
                "quarantined": rep_quarantined or 0,
                "pending": rep_pending or 0,
            },
            "sos": {
                "total": sos_total or 0,
                "transmitted": sos_active or 0,
                "dispatched": sos_dispatched or 0,
                "resolved": sos_resolved or 0,
            },
            "disasters": {
                "active": disasters_active or 0,
            },
            "marine_rescues": {
                "total": marine_total or 0,
            },
            "broadcasts": {
                "total": broadcasts_total or 0,
            },
            "users": {
                "total": users_total or 0,
            }
        },
        "timestamp": now.isoformat()
    }

@router.get("/audit-log")
async def get_audit_log(
    limit: int = Query(50, le=100),
    db: AsyncSession = Depends(get_db)
):
    """Unified chronological timeline of all recent incidents, SOS transmissions, and broadcasts."""
    entries = []

    # Recent reports
    r_res = await db.execute(select(CommunityReport).order_by(desc(CommunityReport.created_at)).limit(limit))
    for r in r_res.scalars().all():
        entries.append({
            "id": r.id,
            "type": "field_report",
            "title": r.title,
            "status": r.status.value if hasattr(r.status, "value") else str(r.status),
            "severity_or_urgency": r.urgency_rank,
            "location": r.address or f"{r.latitude}, {r.longitude}",
            "created_at": r.created_at.isoformat() if r.created_at else None
        })

    # Recent SOS
    s_res = await db.execute(select(SOSEvent).order_by(desc(SOSEvent.created_at)).limit(limit))
    for s in s_res.scalars().all():
        entries.append({
            "id": s.id,
            "type": "sos_emergency",
            "title": f"SOS Distress: {s.emergency_type} from {s.sender_name}",
            "status": s.status.value if hasattr(s.status, "value") else str(s.status),
            "severity_or_urgency": 10,
            "location": f"{s.latitude:.4f}, {s.longitude:.4f}",
            "created_at": s.created_at.isoformat() if s.created_at else None
        })

    # Recent Broadcasts
    b_res = await db.execute(select(BroadcastAlert).order_by(desc(BroadcastAlert.created_at)).limit(limit))
    for b in b_res.scalars().all():
        entries.append({
            "id": b.id,
            "type": "broadcast_alert",
            "title": f"Broadcast: {b.alert_type} ({b.severity})",
            "status": "broadcasted",
            "severity_or_urgency": b.severity,
            "location": b.location,
            "created_at": b.created_at.isoformat() if b.created_at else None
        })

    # Sort merged entries by created_at descending
    entries.sort(key=lambda x: x["created_at"] or "", reverse=True)

    return {
        "status": "success",
        "total_entries": len(entries[:limit]),
        "audit_stream": entries[:limit],
        "logs": entries[:limit]
    }
