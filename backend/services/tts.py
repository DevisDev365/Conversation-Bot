import asyncio
import tempfile
import os
import edge_tts

VOICE_MAPPING = {
    ('uk', 'female'): 'en-GB-SoniaNeural',
    ('uk', 'male'): 'en-GB-RyanNeural',
    ('in', 'female'): 'en-IN-NeerjaNeural',
    ('in', 'male'): 'en-IN-PrabhatNeural'
}

async def synthesize(text: str, dialect: str, voice_gender: str) -> bytes:
    voice = VOICE_MAPPING.get((dialect, voice_gender), 'en-GB-SoniaNeural')
    temp_path = ""
    try:
        fd, temp_path = tempfile.mkstemp(suffix=".mp3")
        os.close(fd)
        
        communicate = edge_tts.Communicate(text, voice)
        await communicate.save(temp_path)
        
        with open(temp_path, "rb") as f:
            audio_bytes = f.read()
            
        await asyncio.sleep(0.05)
        return audio_bytes
    except Exception as e:
        print(f"TTS Error: {e}")
        return b""
    finally:
        if temp_path and os.path.exists(temp_path):
            os.remove(temp_path)
