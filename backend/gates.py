import asyncio
from config import settings

class GateKeeper:
    def __init__(self):
        self.admission = asyncio.Semaphore(settings.ADMISSION_LIMIT)
        self.stt = asyncio.Semaphore(settings.STT_LIMIT)
        self.llm = asyncio.Semaphore(settings.LLM_LIMIT)
        self.tts = asyncio.Semaphore(settings.TTS_LIMIT)
    
    def get_status(self) -> dict:
        # Return current available slots for each gate
        return {
            "admission": self.admission._value,
            "stt": self.stt._value,
            "llm": self.llm._value,
            "tts": self.tts._value
        }

gates = GateKeeper()
