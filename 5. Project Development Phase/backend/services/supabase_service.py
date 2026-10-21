import os
import uuid
import secrets
from datetime import datetime, timezone
from supabase import create_client, Client
from dotenv import load_dotenv
from typing import Optional

load_dotenv()

_client: Optional[Client] = None
_LOCAL_TRIPS: dict = {}
_LOCAL_ITINERARIES: dict = {}


def get_client() -> Optional[Client]:
    global _client
    if _client is None:
        url = os.getenv("SUPABASE_URL", "")
        key = os.getenv("SUPABASE_KEY", "")
        if url and key and "your-project" not in url:
            try:
                _client = create_client(url, key)
            except Exception:
                _client = None
    return _client


# ── Trips ─────────────────────────────────────────────────────────────────────

def create_trip(data: dict) -> dict:
    # Ensure id and share_token
    if "id" not in data or not data["id"]:
        data["id"] = str(uuid.uuid4())
    if "share_token" not in data or not data["share_token"]:
        data["share_token"] = secrets.token_hex(12)
    data["created_at"] = datetime.now(timezone.utc).isoformat()
    data["updated_at"] = data["created_at"]

    sb = get_client()
    if sb:
        try:
            res = sb.table("trips").insert(data).execute()
            if res.data:
                _LOCAL_TRIPS[data["id"]] = res.data[0]
                return res.data[0]
        except Exception:
            pass

    # Resilient fallback
    _LOCAL_TRIPS[data["id"]] = data
    return data


def get_trips_by_user(user_id: str) -> list:
    sb = get_client()
    if sb:
        try:
            res = sb.table("trips").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            if res.data:
                return res.data
        except Exception:
            pass

    return [t for t in _LOCAL_TRIPS.values() if t.get("user_id") == user_id]


def get_trip_by_id(trip_id: str) -> Optional[dict]:
    sb = get_client()
    if sb:
        try:
            res = sb.table("trips").select("*").eq("id", trip_id).single().execute()
            if res.data:
                return res.data
        except Exception:
            pass

    return _LOCAL_TRIPS.get(trip_id)


def get_trip_by_share_token(token: str) -> Optional[dict]:
    sb = get_client()
    if sb:
        try:
            res = sb.table("trips").select("*").eq("share_token", token).single().execute()
            if res.data:
                return res.data
        except Exception:
            pass

    for t in _LOCAL_TRIPS.values():
        if t.get("share_token") == token:
            return t
    return None


def update_trip(trip_id: str, data: dict) -> dict:
    sb = get_client()
    if sb:
        try:
            res = sb.table("trips").update(data).eq("id", trip_id).execute()
            if res.data:
                return res.data[0]
        except Exception:
            pass

    if trip_id in _LOCAL_TRIPS:
        _LOCAL_TRIPS[trip_id].update(data)
        return _LOCAL_TRIPS[trip_id]
    return data


def delete_trip(trip_id: str) -> bool:
    sb = get_client()
    if sb:
        try:
            sb.table("trips").delete().eq("id", trip_id).execute()
        except Exception:
            pass

    _LOCAL_TRIPS.pop(trip_id, None)
    return True


# ── Itineraries ────────────────────────────────────────────────────────────────

def save_itinerary(trip_id: str, itinerary_data: dict) -> dict:
    sb = get_client()
    if sb:
        try:
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
            if res.data:
                _LOCAL_ITINERARIES[trip_id] = itinerary_data
                return res.data[0]
        except Exception:
            pass

    _LOCAL_ITINERARIES[trip_id] = itinerary_data
    return {"trip_id": trip_id, "content": itinerary_data}


def get_itinerary_by_trip(trip_id: str) -> Optional[dict]:
    sb = get_client()
    if sb:
        try:
            res = sb.table("itineraries").select("*").eq("trip_id", trip_id).execute()
            if res.data:
                return res.data[0].get("content")
        except Exception:
            pass

    return _LOCAL_ITINERARIES.get(trip_id)
