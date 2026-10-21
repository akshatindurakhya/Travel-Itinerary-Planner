from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import date
from uuid import UUID


# ── Trip schemas ──────────────────────────────────────────────────────────────

class TripCreate(BaseModel):
    title: str
    destination: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget_level: Optional[str] = "moderate"   # economy | moderate | premium | luxury
    travel_style: Optional[str] = "balanced"   # adventure | cultural | relaxed | romantic | balanced
    interests: Optional[List[str]] = []
    group_size: Optional[int] = 1
    group_type: Optional[str] = "solo"         # solo | couple | family | friends


class TripUpdate(BaseModel):
    title: Optional[str] = None
    destination: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget_level: Optional[str] = None
    travel_style: Optional[str] = None
    interests: Optional[List[str]] = None
    group_size: Optional[int] = None
    group_type: Optional[str] = None


class TripResponse(BaseModel):
    id: str
    user_id: Optional[str] = None
    title: str
    destination: str
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    budget_level: Optional[str] = None
    travel_style: Optional[str] = None
    interests: Optional[List[str]] = []
    group_size: Optional[int] = 1
    group_type: Optional[str] = None
    share_token: Optional[str] = None
    created_at: Optional[str] = None
    updated_at: Optional[str] = None


# ── Itinerary schemas ─────────────────────────────────────────────────────────

class Activity(BaseModel):
    time: str                        # e.g. "09:00 AM"
    name: str
    description: str
    location: str
    duration: str                    # e.g. "2 hours"
    estimated_cost: float
    category: str                    # attraction | dining | transport | accommodation | leisure


class ItineraryDay(BaseModel):
    day_number: int
    date: Optional[str] = None
    theme: str                       # e.g. "Arrival & City Highlights"
    activities: List[Activity]
    total_day_cost: float
    tips: Optional[List[str]] = []


class ItineraryResponse(BaseModel):
    trip_id: str
    destination: str
    total_days: int
    total_estimated_cost: float
    currency: str = "USD"
    days: List[ItineraryDay]
    accommodation_suggestions: Optional[List[str]] = []
    transport_tips: Optional[List[str]] = []
    general_tips: Optional[List[str]] = []


class ItineraryRequest(BaseModel):
    trip_id: str
    destination: str
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    budget_level: str = "moderate"
    travel_style: str = "balanced"
    interests: List[str] = []
    group_size: int = 1
    group_type: str = "solo"
    num_days: int = 3


class RegenerateRequest(BaseModel):
    day_number: Optional[int] = None   # None = regenerate entire trip


# ── Share schemas ─────────────────────────────────────────────────────────────

class ShareResponse(BaseModel):
    trip: TripResponse
    itinerary: Optional[ItineraryResponse] = None
