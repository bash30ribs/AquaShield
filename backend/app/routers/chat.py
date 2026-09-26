"""
FastAPI Router: AI Emergency Assistant
"""
from fastapi import APIRouter, Form, Body, Request
from typing import Optional, Dict, Any
from app.services.chat_service import ChatService

router = APIRouter(prefix="/api/chat", tags=["AI Assistant"])

@router.post("")
async def ai_assistant_chat(request: Request):
    message = ""
    # Support both JSON payload and Form-encoded data
    content_type = request.headers.get("content-type", "")
    if "application/json" in content_type:
        try:
            data = await request.json()
            message = data.get("message", "")
        except Exception:
            pass
    else:
        try:
            form = await request.form()
            message = form.get("message", "")
        except Exception:
            pass
    
    if not message:
        return {"reply": "Please specify a question or coastal safety inquiry.", "sources": []}
        
    return ChatService.get_response(str(message))

@router.get("/suggestions")
def get_chat_suggestions():
    return {"suggestions": ChatService.get_suggestions()}
