import google.generativeai as genai
from groq import Groq
import re
from config import settings
from prompts import SYSTEM_PROMPT_UK, SYSTEM_PROMPT_IN

genai.configure(api_key=settings.GEMINI_API_KEY)
groq_client = Groq(api_key=settings.GROQ_API_KEY)

async def generate_response(user_text: str, dialect: str, history: list[dict]) -> str:
    system_prompt_text = SYSTEM_PROMPT_UK if dialect == 'uk' else SYSTEM_PROMPT_IN
    
    try:
        model = genai.GenerativeModel('gemini-2.0-flash')
        history_messages = []
        for turn in history:
            history_messages.append({
                "role": "model" if turn["role"] == "assistant" else "user",
                "parts": [turn["content"]]
            })
        
        contents = [{"role": "user", "parts": [system_prompt_text]}] + history_messages + [{"role": "user", "parts": [user_text]}]
        response = await model.generate_content_async(contents)
        text = response.text
    except Exception as e:
        print(f"Gemini LLM Error: {e}. Falling back to Groq Llama 3.1 8B.")
        try:
            messages = [{"role": "system", "content": system_prompt_text}]
            for turn in history:
                messages.append({"role": turn["role"], "content": turn["content"]})
            messages.append({"role": "user", "content": user_text})
            
            response = groq_client.chat.completions.create(
                model="llama-3.1-8b-instant",
                messages=messages
            )
            text = response.choices[0].message.content
        except Exception as groq_e:
            print(f"Groq LLM Error: {groq_e}")
            text = "I'm sorry, I'm having trouble thinking right now."
            
    # Sanitize response
    text = re.sub(r'[*_#>`\n]', ' ', text)
    text = re.sub(r'\[.*?\]|\(.*?\)', '', text)
    return text.strip()
