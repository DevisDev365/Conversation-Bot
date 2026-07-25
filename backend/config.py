import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
    GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
    ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*")
    
    ADMISSION_LIMIT = int(os.getenv("ADMISSION_LIMIT", "30"))
    STT_LIMIT = int(os.getenv("STT_LIMIT", "15"))
    LLM_LIMIT = int(os.getenv("LLM_LIMIT", "10"))
    TTS_LIMIT = int(os.getenv("TTS_LIMIT", "8"))
    
    MAX_CONVERSATION_TURNS = 3
    MAX_SESSION_DURATION = 480

settings = Settings()
