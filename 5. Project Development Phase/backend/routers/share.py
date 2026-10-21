from fastapi import APIRouter, HTTPException
from models.schemas import ShareResponse
import services.supabase_service as db

router = APIRouter(prefix="/share", tags=["share"])


@router.get("/{token}", response_model=ShareResponse)
def get_shared_trip(token: str):
    trip = db.get_trip_by_share_token(token)
    if not trip:
        raise HTTPException(status_code=404, detail="Shared trip not found")

    itinerary_data = db.get_itinerary_by_trip(trip["id"])

    return ShareResponse(trip=trip, itinerary=itinerary_data)
