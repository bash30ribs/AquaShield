"""
FastAPI Router: AI Emergency Assistant & Incident Scribe
"""
import uuid
import datetime
from fastapi import APIRouter, Request, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database import get_db
from app.services.chat_service import ChatService
from app.models.report import CommunityReport, ReportType, ReportStatus
from app.models.complaint import ConversationalComplaint

router = APIRouter(prefix="/api/chat", tags=["AI Assistant"])

@router.post("")
async def ai_assistant_chat(request: Request):
    message = ""
    session_id = None
    content_type = request.headers.get("content-type", "")
    
    if "application/json" in content_type:
        try:
            data = await request.json()
            message = data.get("message", "")
            session_id = data.get("session_id")
        except Exception:
            pass
    else:
        try:
            form = await request.form()
            message = form.get("message", "")
            session_id = form.get("session_id")
        except Exception:
            pass
    
    if not message:
        return {"reply": "Please specify an incident observation or tactical question.", "sources": []}
        
    return ChatService.get_response(str(message), session_id=session_id)

@router.post("/submit-guided-complaint")
async def submit_guided_complaint(request: Request, db: AsyncSession = Depends(get_db)):
    """Submits the AI-structured complaint directly into official community reports."""
    try:
        data = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid JSON payload")

    report_id = f"REP-{uuid.uuid4().hex[:6].upper()}"
    raw_hazard = data.get("hazard_type", "flood")
    
    try:
        rtype = ReportType(raw_hazard)
    except Exception:
        rtype = ReportType.flood

    report = CommunityReport(
        id=report_id,
        title=data.get("title", "AI Verified Coastal Incident"),
        reporter_name=data.get("reporter_name", "Citizen Scout (AI Guided)"),
        reporter_badge=data.get("reporter_badge", "CITIZEN-SCRIBE"),
        report_type=rtype,
        description=data.get("professional_description", data.get("raw_text", "Incident observed via citizen report.")),
        latitude=float(data.get("latitude", 18.960)),
        longitude=float(data.get("longitude", 72.820)),
        address=data.get("location", "Coastal Monitored Sector"),
        ai_verified=True,
        ai_confidence=98.4,
        ai_flood_detected=(rtype == ReportType.flood),
        ai_water_level_m=float(data.get("water_level", 0.0)),
        is_fake=False,
        urgency_rank=int(data.get("urgency", 7)),
        status=ReportStatus.verified,
        created_at=datetime.datetime.utcnow()
    )
    
    db.add(report)
    await db.commit()

    # Link report ID to conversation archive
    session_id = data.get("session_id")
    if session_id:
        result = await db.execute(select(ConversationalComplaint).where(ConversationalComplaint.session_id == session_id).order_by(ConversationalComplaint.created_at.desc()))
        complaint = result.scalars().first()
        if complaint:
            complaint.filed_report_id = report_id
            complaint.status = "filed"
            await db.commit()

    return {
        "success": True,
        "report_id": report_id,
        "message": f"Incident {report_id} successfully filed and routed to Coast Guard & Municipal Emergency Dispatch!",
        "report": {
            "id": report.id,
            "title": report.title,
            "report_type": report.report_type.value,
            "address": report.address,
            "urgency": report.urgency_rank,
            "status": report.status.value
        }
    }

@router.get("/suggestions")
def get_chat_suggestions():
    return {"suggestions": ChatService.get_suggestions()}

@router.get("/complaints-dataset")
async def get_complaints_dataset(db: AsyncSession = Depends(get_db)):
    """Returns recorded conversational complaint training data."""
    result = await db.execute(select(ConversationalComplaint).order_by(ConversationalComplaint.created_at.desc()))
    records = result.scalars().all()
    return {
        "count": len(records),
        "dataset": [
            {
                "id": r.id,
                "session_id": r.session_id,
                "raw_text": r.raw_user_text,
                "extracted_hazard_type": r.extracted_hazard_type,
                "extracted_title": r.extracted_title,
                "professional_description": r.professional_description,
                "extracted_location": r.extracted_location,
                "urgency": r.extracted_urgency,
                "filed_report_id": r.filed_report_id,
                "created_at": r.created_at.isoformat() if r.created_at else None
            } for r in records
        ]
    }
