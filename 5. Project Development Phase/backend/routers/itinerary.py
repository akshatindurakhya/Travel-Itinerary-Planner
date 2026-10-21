from fastapi import APIRouter, HTTPException, Header
from typing import Optional
from models.schemas import ItineraryRequest, ItineraryResponse, RegenerateRequest
import services.supabase_service as db
from services.gemini_service import generate_itinerary, regenerate_day

router = APIRouter(prefix="/itinerary", tags=["itinerary"])


@router.post("/generate", response_model=ItineraryResponse)
async def generate(req: ItineraryRequest, x_user_id: Optional[str] = Header(None)):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Missing X-User-Id header")

    # Verify trip ownership
    trip = db.get_trip_by_id(req.trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.get("user_id") != x_user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    try:
        itinerary = await generate_itinerary(
            trip_id=req.trip_id,
            destination=req.destination,
            num_days=req.num_days,
            budget_level=req.budget_level,
            travel_style=req.travel_style,
            interests=req.interests,
            group_size=req.group_size,
            group_type=req.group_type,
            start_date=req.start_date,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI generation failed: {str(e)}")

    # Save to database
    db.save_itinerary(req.trip_id, itinerary.model_dump())

    return itinerary


@router.get("/{trip_id}", response_model=ItineraryResponse)
def get_itinerary(trip_id: str, x_user_id: Optional[str] = Header(None)):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Missing X-User-Id header")

    trip = db.get_trip_by_id(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.get("user_id") != x_user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    itinerary = db.get_itinerary_by_trip(trip_id)
    if not itinerary:
        raise HTTPException(status_code=404, detail="Itinerary not found")
    return itinerary


@router.post("/{trip_id}/regenerate", response_model=ItineraryResponse)
async def regenerate(trip_id: str, req: RegenerateRequest, x_user_id: Optional[str] = Header(None)):
    if not x_user_id:
        raise HTTPException(status_code=401, detail="Missing X-User-Id header")

    trip = db.get_trip_by_id(trip_id)
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")
    if trip.get("user_id") != x_user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Calculate days
    start = trip.get("start_date")
    end = trip.get("end_date")
    num_days = 3
    if start and end:
        from datetime import date
        try:
            d1 = date.fromisoformat(start)
            d2 = date.fromisoformat(end)
            num_days = max(1, (d2 - d1).days + 1)
        except Exception:
            pass

    if req.day_number is not None:
        # Regenerate a single day
        existing = db.get_itinerary_by_trip(trip_id)
        if not existing:
            raise HTTPException(status_code=404, detail="No existing itinerary to regenerate")
        new_day = await regenerate_day(
            trip_id=trip_id,
            destination=trip["destination"],
            day_number=req.day_number,
            budget_level=trip.get("budget_level", "moderate"),
            travel_style=trip.get("travel_style", "balanced"),
            interests=trip.get("interests", []),
            group_size=trip.get("group_size", 1),
            group_type=trip.get("group_type", "solo"),
        )
        # Replace the specific day in existing itinerary
        days = existing.get("days", [])
        days = [d for d in days if d.get("day_number") != req.day_number]
        days.append(new_day.model_dump())
        days.sort(key=lambda d: d["day_number"])
        existing["days"] = days
        existing["total_estimated_cost"] = sum(d.get("total_day_cost", 0) for d in days)
        db.save_itinerary(trip_id, existing)
        return existing
    else:
        # Regenerate full itinerary
        itinerary = await generate_itinerary(
            trip_id=trip_id,
            destination=trip["destination"],
            num_days=num_days,
            budget_level=trip.get("budget_level", "moderate"),
            travel_style=trip.get("travel_style", "balanced"),
            interests=trip.get("interests", []),
            group_size=trip.get("group_size", 1),
            group_type=trip.get("group_type", "solo"),
            start_date=trip.get("start_date"),
        )
        db.save_itinerary(trip_id, itinerary.model_dump())
        return itinerary
