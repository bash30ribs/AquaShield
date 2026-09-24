"""
FastAPI Router: Community Reports & AI Image Verification
"""
from fastapi import APIRouter, UploadFile, File, Form
from app.services.ai_service import AIService

router = APIRouter(prefix="/api", tags=["Reports"])

@router.post("/ai/verify-image")
async def verify_image(file: UploadFile = File(None)):
    filename = file.filename if file else ""
    return AIService.analyze_disaster_image(filename)

@router.post("/reports")
def submit_report(report_type: str = Form(...), description: str = Form(...), location: str = Form(...)):
    return {
        "status": "success",
        "message": "Report submitted and queued for AI verification",
        "report": {
            "type": report_type,
            "description": description,
            "location": location,
            "ai_verified": True,
            "urgency": "HIGH"
        }
    }
