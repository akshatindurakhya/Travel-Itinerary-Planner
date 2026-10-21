from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from models.schemas import TripCreate, TripUpdate, TripResponse
import services.supabase_service as db

router = APIRouter(prefix="/trips", tags=["trips"])


def _require_user(x_user_id: Optional[str]) -> str:
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Missing X-User-Id header")
    return x_user_id


@router.post("", response_model=TripResponse)
def create_trip(trip: TripCreate, x_user_id: Optional[str] = Header(None)):
    user_id = _require_user(x_user_id)
    data = trip.model_dump()
    # Convert dates to strings
    if data.get("start_date"):
        data["start_date"] = str(data["start_date"])
    if data.get("end_date"):
        data["end_date"] = str(data["end_date"])
    data["user_id"] = user_id
    result = db.create_trip(data)
    if not result:
        raise HTTPException(status_code=500, detail="Failed to create trip")
    return result


@router.get("", response_model=list[TripResponse])
def list_trips(x_user_id: Optional[str] = Header(None)):
    user_id = _require_user(x_user_id)
    return db.get_trips_by_user(user_id)


@router.get("/{trip_id}", response_model=TripResponse)
def get_trip(trip_id: str, x_user_id: Optional[str] = Header(None)):
    user_id = _require_user(x_user_id)
    trip = db.get_trip_by_id(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    return trip


@router.put("/{trip_id}", response_model=TripResponse)
def update_trip(trip_id: str, updates: TripUpdate, x_user_id: Optional[str] = Header(None)):
    user_id = _require_user(x_user_id)
    trip = db.get_trip_by_id(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    data = {k: v for k, v in updates.model_dump().items() if v is not None}
    if "start_date" in data and data["start_date"]:
        data["start_date"] = str(data["start_date"])
    if "end_date" in data and data["end_date"]:
        data["end_date"] = str(data["end_date"])
    return db.update_trip(trip_id, data)


@router.delete("/{trip_id}")
def delete_trip(trip_id: str, x_user_id: Optional[str] = Header(None)):
    user_id = _require_user(x_user_id)
    trip = db.get_trip_by_id(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.get("user_id") != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")
    db.delete_trip(trip_id)
    return {"message": "Trip deleted successfully"}
