"""
FastAPI Router: AI Emergency Assistant
"""
from fastapi import APIRouter, Form
from app.services.chat_service import ChatService

router = APIRouter(prefix="/api/chat", tags=["AI Assistant"])

@router.post("")
def ai_assistant_chat(message: str = Form(...)):
    return ChatService.get_response(message)
