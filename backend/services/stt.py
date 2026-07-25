import asyncio
import tempfile
import os
from groq import Groq
from config import settings

client = Groq(api_key=settings.GROQ_API_KEY)

async def transcribe(audio_bytes: bytes, filename: str) -> str:
    try:
        with tempfile.NamedTemporaryFile(suffix='.webm', delete=False) as temp_file:
            temp_file.write(audio_bytes)
            temp_path = temp_file.name

        def sync_transcribe():
            with open(temp_path, "rb") as f:
                return client.audio.transcriptions.create(
                    model='whisper-large-v3-turbo',
                    file=(filename, f)
                )

        transcription = await asyncio.to_thread(sync_transcribe)
        return transcription.text
    except Exception as e:
        print(f"STT Error: {e}")
        return "I didn't quite catch that. Could you say that again?"
    finally:
        if 'temp_path' in locals() and os.path.exists(temp_path):
            os.remove(temp_path)
