import os
import json
import asyncio
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
from google import genai
from google.genai import types

load_dotenv()

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Get API key from environment (checking both common variable names)
api_key = os.getenv("GEMINI_API_KEY") or os.getenv("GOOGLE_API_KEY")

# Initialize Gemini Client
try:
    client = genai.Client(api_key=api_key)
except Exception as e:
    print(f"Failed to initialize Gemini Client: {e}")
    client = None


@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

@app.websocket("/ws/converse")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    try:
        # Wait for the first message to get dialect and voice config
        init_data = await websocket.receive_text()
        config = json.loads(init_data)
        dialect = config.get("dialect", "uk")
        gender = config.get("gender", "female")
        
        # Determine Voice Name
        # Gemini 2.0 voices: Puck (male), Aoede (female), Charon (male), Kore (female), Fenrir (male), Leda (female)
        voice_name = "Aoede" # Default female
        if gender == "male":
            voice_name = "Puck"
            
        accent_instruction = "You must always speak with a thick UK British accent."
        if dialect == "in":
            accent_instruction = "You must always speak with an Indian English accent."
            
        system_instruction = f"{accent_instruction} You are a friendly AI assistant having a brief voice conversation. Keep your answers concise, natural, and conversational."
        
        # Connect to Gemini Live
        async with client.aio.live.connect(
            model="gemini-2.0-flash-exp",
            config=types.LiveConnectConfig(
                response_modalities=[types.LiveModality.AUDIO],
                system_instruction=types.Content(parts=[types.Part.from_text(text=system_instruction)]),
                speech_config=types.SpeechConfig(
                    voice_config=types.VoiceConfig(
                        prebuilt_voice_config=types.PrebuiltVoiceConfig(
                            voice_name=voice_name
                        )
                    )
                )
            )
        ) as session:
            print("Connected to Gemini Live API")
            
            # Send initial greeting
            greeting_msg = "Hello! I'm your AI assistant. How are you doing today?"
            await session.send(input=greeting_msg, end_of_turn=True)

            # Task to receive audio from Gemini and send to browser
            async def receive_from_gemini():
                async for response in session.receive():
                    server_content = response.server_content
                    if server_content is not None:
                        model_turn = server_content.model_turn
                        if model_turn:
                            for part in model_turn.parts:
                                # Send raw audio bytes to browser
                                if part.inline_data and part.inline_data.data:
                                    await websocket.send_bytes(part.inline_data.data)

            # Task to receive audio from browser and send to Gemini
            async def send_to_gemini():
                try:
                    while True:
                        # Receive PCM audio from browser
                        data = await websocket.receive_bytes()
                        
                        # Gemini expects raw PCM16 at 16kHz
                        await session.send(
                            input=types.LiveClientRealtimeInput(
                                media_chunks=[
                                    types.Blob(
                                        data=data,
                                        mime_type="audio/pcm;rate=16000"
                                    )
                                ]
                            )
                        )
                except WebSocketDisconnect:
                    print("Browser disconnected")
            
            # Run both tasks concurrently
            receive_task = asyncio.create_task(receive_from_gemini())
            send_task = asyncio.create_task(send_to_gemini())
            
            done, pending = await asyncio.wait(
                [receive_task, send_task],
                return_when=asyncio.FIRST_COMPLETED
            )
            
            # Cancel the pending task if one finishes/fails
            for task in pending:
                task.cancel()
            
    except Exception as e:
        print(f"WebSocket error: {e}")
    finally:
        try:
            await websocket.close()
        except Exception:
            pass
