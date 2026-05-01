"""
Chat route — receives user message, returns AI response from Gemini.
"""

from fastapi import APIRouter
from pydantic import BaseModel

from backend.services.gemini import get_ai_response

router = APIRouter()


class ChatMessage(BaseModel):
    message: str
    history: list[dict] | None = None


class ChatResponse(BaseModel):
    response: str
    status: str = "ok"


@router.post("/api/chat", response_model=ChatResponse)
async def chat(payload: ChatMessage):
    """
    Process a chat message and return an AI response.
    
    Expects:
        { "message": "What's the weather?", "history": [...] }
    
    Returns:
        { "response": "I don't have real-time weather...", "status": "ok" }
    """
    ai_response = get_ai_response(
        message=payload.message,
        history=payload.history,
    )

    return ChatResponse(response=ai_response)
