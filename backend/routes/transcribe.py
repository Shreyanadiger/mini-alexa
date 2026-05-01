"""
Transcribe route — receives audio file, returns transcribed text.
This is a fallback for browsers that don't support the Web Speech API.
"""

from fastapi import APIRouter, UploadFile, File

from backend.services.speech import transcribe_audio

router = APIRouter()


@router.post("/api/transcribe")
async def transcribe(audio: UploadFile = File(...)):
    """
    Transcribe an uploaded audio file to text.
    
    Expects: multipart form with an audio file field named 'audio'
    Returns: { "text": "transcribed words here", "status": "ok" }
    """
    audio_bytes = await audio.read()
    text = transcribe_audio(audio_bytes)

    return {"text": text, "status": "ok"}
