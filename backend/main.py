from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import base64
import json
import re

from config import settings
from gates import gates
from models import ConversationResponse, HealthResponse
from services import stt, llm, tts
from prompts import GREETING_UK, GREETING_IN

app = FastAPI(title="Voice AI Research Platform")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS.split(','),
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)

@app.get('/health')
async def health():
    return HealthResponse(status='ok', gates=gates.get_status())

@app.post('/api/converse', response_model=ConversationResponse)
async def converse(
    file: UploadFile = File(...),
    dialect: str = Form(...),
    voice_gender: str = Form('female'),
    history: str = Form('[]')  # JSON string of history turns
):
    history_list = json.loads(history)
    audio_bytes = await file.read()
    
    async with gates.admission:
        # Gate 2: STT
        async with gates.stt:
            transcript = await stt.transcribe(audio_bytes, file.filename or 'audio.webm')
        
        # Gate 3: LLM
        async with gates.llm:
            response_text = await llm.generate_response(transcript, dialect, history_list)
        
        # Gate 4: TTS
        async with gates.tts:
            audio_mp3 = await tts.synthesize(response_text, dialect, voice_gender)
    
    audio_b64 = base64.b64encode(audio_mp3).decode('utf-8')
    
    return ConversationResponse(
        transcript=transcript,
        response_text=response_text,
        audio_base64=audio_b64
    )

@app.post('/api/greeting', response_model=ConversationResponse)
async def get_greeting(
    dialect: str = Form(...),
    voice_gender: str = Form('female')
):
    greeting_text = GREETING_UK if dialect == 'uk' else GREETING_IN
    
    async with gates.tts:
        audio_mp3 = await tts.synthesize(greeting_text, dialect, voice_gender)
    
    audio_b64 = base64.b64encode(audio_mp3).decode('utf-8')
    
    return ConversationResponse(
        transcript='',
        response_text=greeting_text,
        audio_base64=audio_b64
    )

