import httpx
from config import settings

async def write_session_data(data: dict) -> bool:
    if not settings.GOOGLE_SHEETS_WEBHOOK_URL:
        print("GOOGLE_SHEETS_WEBHOOK_URL not configured")
        return False
        
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(settings.GOOGLE_SHEETS_WEBHOOK_URL, json=data)
            response.raise_for_status()
            return True
    except Exception as e:
        print(f"Sheets write error: {e}")
        return False
