from supabase import create_client, Client
from config import settings

def get_supabase() -> Client | None:
    if not settings.SUPABASE_URL or not settings.SUPABASE_KEY:
        return None
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

async def write_session_data(data: dict) -> bool:
    supabase = get_supabase()
    if not supabase:
        print("Supabase credentials not configured")
        return False
        
    try:
        payload = {
            "participant_id": data.get("participant_id"),
            "dialect": data.get("session", {}).get("dialect"),
            "voice_gender": data.get("session", {}).get("voice_gender"),
            "duration_seconds": data.get("session", {}).get("duration_seconds"),
            "raw_data": data # This requires a JSONB column in Supabase
        }
        
        supabase.table('research_sessions').insert(payload).execute()
        return True
    except Exception as e:
        print(f"Supabase write error: {e}")
        return False
