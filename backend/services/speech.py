"""
Speech-to-text service using SpeechRecognition library.
Uses Google's free STT API as a fallback for browsers 
that don't support the Web Speech API.
"""

import io
import speech_recognition as sr


def transcribe_audio(audio_bytes: bytes, sample_rate: int = 16000) -> str:
    """
    Transcribe raw audio bytes to text using Google Speech Recognition.
    
    Args:
        audio_bytes: WAV audio data as bytes
        sample_rate: Sample rate of the audio (default 16000)
    
    Returns:
        Transcribed text string
    """
    recognizer = sr.Recognizer()

    try:
        # Wrap the bytes in an AudioFile-compatible object
        audio_file = io.BytesIO(audio_bytes)
        with sr.AudioFile(audio_file) as source:
            audio_data = recognizer.record(source)

        # Use Google's free speech recognition
        text = recognizer.recognize_google(audio_data)
        return text

    except sr.UnknownValueError:
        return "[Could not understand the audio]"
    except sr.RequestError as e:
        print(f"[Speech Recognition Error] {e}")
        return "[Speech service unavailable]"
    except Exception as e:
        print(f"[Transcription Error] {e}")
        return "[Error transcribing audio]"
