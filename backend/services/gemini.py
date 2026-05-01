"""
Gemini AI Service — wraps Google Generative AI SDK.
Keeps conversation context per session.
"""

import os
import google.generativeai as genai
from dotenv import load_dotenv

load_dotenv()

genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

# System instruction that shapes Mini Alexa's personality
SYSTEM_INSTRUCTION = """You are Mini Alexa, a friendly and helpful voice assistant.
Keep your responses concise and conversational — ideally 1-3 sentences.
You can answer questions, tell jokes, give weather info, set reminders, 
do math, explain concepts, and have casual conversations.
If you don't know something, say so honestly.
Always be warm, upbeat, and helpful. Use a natural speaking style."""

model = genai.GenerativeModel(
    model_name="gemini-2.0-flash",
    system_instruction=SYSTEM_INSTRUCTION,
)


def get_ai_response(message: str, history: list[dict] | None = None) -> str:
    """
    Send a message to Gemini and get a response.
    
    Args:
        message: The user's current message
        history: List of past messages [{"role": "user"|"model", "parts": ["..."]}]
    
    Returns:
        The AI's text response
    """
    try:
        # Build chat history for context
        chat_history = []
        if history:
            for msg in history:
                chat_history.append({
                    "role": msg["role"],
                    "parts": [msg["content"]],
                })

        chat = model.start_chat(history=chat_history)
        response = chat.send_message(message)
        return response.text.strip()

    except Exception as e:
        print(f"[Gemini Error] {e}")
        return "Sorry, I'm having trouble thinking right now. Could you try again?"
