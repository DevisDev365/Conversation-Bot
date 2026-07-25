from pydantic import BaseModel
from typing import Literal, List, Dict, Any

class HistoryTurn(BaseModel):
    role: Literal['user', 'assistant']
    content: str

class ConversationResponse(BaseModel):
    transcript: str
    response_text: str
    audio_base64: str

class SessionData(BaseModel):
    participant_id: str
    demographics: Dict[str, Any]
    session: Dict[str, Any]
    conversation: List[Dict[str, Any]]
    survey: Dict[str, Any]

class HealthResponse(BaseModel):
    status: str
    gates: Dict[str, int]
