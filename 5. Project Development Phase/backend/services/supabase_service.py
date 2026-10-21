import os
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

_client: Optional[Client] = None


def get_client() -> Client:
    global _client
    if _client is None:
        url = os.getenv("SUPABASE_URL", "")
        key = os.getenv("SUPABASE_KEY", "")
        _client = create_client(url, key)
    return _client


# ── Trips ─────────────────────────────────────────────────────────────────────

def create_trip(data: dict) -> dict:
    sb = get_client()
    res = sb.table("trips").insert(data).execute()
    return res.data[0] if res.data else {}


def get_trips_by_user(user_id: str) -> list:
    sb = get_client()
    res = sb.table("trips").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    return res.data or []


def get_trip_by_id(trip_id: str) -> Optional[dict]:
    sb = get_client()
    res = sb.table("trips").select("*").eq("id", trip_id).single().execute()
    return res.data


def get_trip_by_share_token(token: str) -> Optional[dict]:
    sb = get_client()
    res = sb.table("trips").select("*").eq("share_token", token).single().execute()
    return res.data


def update_trip(trip_id: str, data: dict) -> dict:
    sb = get_client()
    res = sb.table("trips").update(data).eq("id", trip_id).execute()
    return res.data[0] if res.data else {}


def delete_trip(trip_id: str) -> bool:
    sb = get_client()
    sb.table("trips").delete().eq("id", trip_id).execute()
    return True


# ── Itineraries ────────────────────────────────────────────────────────────────

def save_itinerary(trip_id: str, itinerary_data: dict) -> dict:
    sb = get_client()
    # Upsert full itinerary as a single record
    existing = sb.table("itineraries").select("id").eq("trip_id", trip_id).execute()
    if existing.data:
        res = sb.table("itineraries").update({
            "content": itinerary_data,
            "estimated_cost": itinerary_data.get("total_estimated_cost", 0),
        }).eq("trip_id", trip_id).execute()
    else:
        res = sb.table("itineraries").insert({
            "trip_id": trip_id,
            "content": itinerary_data,
            "estimated_cost": itinerary_data.get("total_estimated_cost", 0),
        }).execute()
    return res.data[0] if res.data else {}


def get_itinerary_by_trip(trip_id: str) -> Optional[dict]:
    sb = get_client()
    res = sb.table("itineraries").select("*").eq("trip_id", trip_id).execute()
    if res.data:
        return res.data[0].get("content")
    return None
