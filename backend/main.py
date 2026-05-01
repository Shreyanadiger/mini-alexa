"""
Mini Alexa — FastAPI Backend
============================
Main entry point. Mounts CORS middleware and includes all route modules.

Run with:
    uvicorn backend.main:app --reload --port 8000
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

# Load environment variables from .env
load_dotenv()

from backend.routes import chat, transcribe

app = FastAPI(
    title="Mini Alexa API",
    description="Voice assistant backend powered by Gemini AI",
    version="1.0.0",
)

# Allow React dev server to talk to the API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount route modules
app.include_router(chat.router, tags=["Chat"])
app.include_router(transcribe.router, tags=["Transcribe"])


@app.get("/")
async def root():
    return {
        "app": "Mini Alexa API",
        "version": "1.0.0",
        "status": "running",
        "endpoints": ["/api/chat", "/api/transcribe"],
    }
