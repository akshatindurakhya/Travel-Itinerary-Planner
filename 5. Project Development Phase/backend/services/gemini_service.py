import os
import json
import re
from typing import Optional
import httpx

try:
    import google.generativeai as genai
except ImportError:
    genai = None

try:
    from dotenv import load_dotenv
    load_dotenv()
except ImportError:
    pass

from models.schemas import ItineraryResponse, ItineraryDay, Activity

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
if GEMINI_API_KEY and genai is not None:
    try:
        genai.configure(api_key=GEMINI_API_KEY)
    except Exception:
        pass

CANDIDATE_MODELS = [
    "gemini-flash-lite-latest",
    "gemini-flash-latest",
    "gemini-2.5-flash-lite",
    "gemini-2.5-flash",
    "gemini-1.5-flash",
]


def _call_gemini_api(prompt: str) -> str:
    """Call Google Gemini with multi-model fallback and direct REST resilience."""
    api_key = os.getenv("GEMINI_API_KEY", GEMINI_API_KEY)
    if not api_key:
        raise ValueError("GEMINI_API_KEY is not configured")

    last_error = None

    # Primary method: Direct REST via httpx (handles newer Google keys and modern model names robustly)
    try:
        with httpx.Client(timeout=45.0) as client:
            for model_name in CANDIDATE_MODELS:
                url = f"https://generativelanguage.googleapis.com/v1beta/models/{model_name}:generateContent?key={api_key}"
                headers = {
                    "Content-Type": "application/json",
                    "x-goog-api-key": api_key,
                }
                payload = {
                    "contents": [{"parts": [{"text": prompt}]}]
                }
                try:
                    resp = client.post(url, headers=headers, json=payload)
                    if resp.status_code == 200:
                        data = resp.json()
                        candidates = data.get("candidates", [])
                        if candidates and "content" in candidates[0]:
                            parts = candidates[0]["content"].get("parts", [])
                            if parts and "text" in parts[0]:
                                return parts[0]["text"]
                    else:
                        last_error = f"{resp.status_code}: {resp.text}"
                except Exception as ex:
                    last_error = str(ex)
                    continue
    except Exception as e:
        last_error = str(e)

    # Fallback method: google-generativeai SDK if installed
    if genai is not None:
        for model_name in CANDIDATE_MODELS:
            try:
                m = genai.GenerativeModel(model_name)
                resp = m.generate_content(prompt)
                if resp and resp.text:
                    return resp.text
            except Exception as ex:
                last_error = str(ex)
                continue

    raise RuntimeError(f"All Gemini models failed. Last error: {last_error}")


def _build_prompt(
    destination: str,
    num_days: int,
    budget_level: str,
    travel_style: str,
    interests: list[str],
    group_size: int,
    group_type: str,
    start_date: Optional[str],
) -> str:
    interests_str = ", ".join(interests) if interests else "general sightseeing"
    date_info = f"starting from {start_date}" if start_date else "for an upcoming trip"

    budget_guide = {
        "economy": "budget-friendly options, street food, hostels or budget hotels, public transport",
        "moderate": "mid-range restaurants, 3-star hotels, mix of public and private transport",
        "premium": "upscale restaurants, 4-star hotels, private transport, premium experiences",
        "luxury": "fine dining, 5-star hotels, private tours, exclusive experiences",
    }.get(budget_level, "moderate options")

    style_guide = {
        "adventure": "outdoor adventures, hiking, sports, thrilling activities",
        "cultural": "museums, historical sites, local traditions, art galleries",
        "relaxed": "leisurely pace, scenic spots, cafes, minimal rushing",
        "romantic": "intimate restaurants, scenic viewpoints, couple experiences, sunset spots",
        "balanced": "a mix of sightseeing, dining, culture, and leisure",
    }.get(travel_style, "balanced activities")

    return f"""You are an expert travel planner. Create a detailed, realistic {num_days}-day travel itinerary for {destination} {date_info}.

Traveler profile:
- Group: {group_type} ({group_size} person{'s' if group_size > 1 else ''})
- Budget: {budget_level} ({budget_guide})
- Travel style: {travel_style} ({style_guide})
- Interests: {interests_str}

Return ONLY valid JSON (no markdown, no code fences) matching this exact structure:
{{
  "destination": "{destination}",
  "total_days": {num_days},
  "currency": "USD",
  "total_estimated_cost": <number>,
  "accommodation_suggestions": ["suggestion1", "suggestion2", "suggestion3"],
  "transport_tips": ["tip1", "tip2"],
  "general_tips": ["tip1", "tip2", "tip3"],
  "days": [
    {{
      "day_number": 1,
      "date": "Day 1",
      "theme": "Arrival & City Highlights",
      "total_day_cost": <number>,
      "tips": ["useful tip for the day"],
      "activities": [
        {{
          "time": "09:00 AM",
          "name": "Activity Name",
          "description": "Brief engaging description of the activity",
          "location": "Specific location name",
          "duration": "2 hours",
          "estimated_cost": <number per person>,
          "category": "attraction"
        }}
      ]
    }}
  ]
}}

Category must be one of: attraction, dining, transport, accommodation, leisure.
Include 4-6 activities per day covering morning, afternoon, and evening.
Estimated costs should be realistic in USD per person.
Make it detailed, engaging, and practical."""


def _parse_itinerary(raw: str, trip_id: str, destination: str) -> ItineraryResponse:
    """Parse Gemini response into ItineraryResponse."""
    # Strip markdown code fences if present
    cleaned = re.sub(r"```(?:json)?\s*|\s*```", "", raw).strip()

    data = json.loads(cleaned)

    days = []
    for day_data in data.get("days", []):
        activities = [
            Activity(
                time=a.get("time", ""),
                name=a.get("name", ""),
                description=a.get("description", ""),
                location=a.get("location", ""),
                duration=a.get("duration", ""),
                estimated_cost=float(a.get("estimated_cost", 0)),
                category=a.get("category", "attraction"),
            )
            for a in day_data.get("activities", [])
        ]
        days.append(
            ItineraryDay(
                day_number=day_data.get("day_number", 1),
                date=day_data.get("date"),
                theme=day_data.get("theme", ""),
                activities=activities,
                total_day_cost=float(day_data.get("total_day_cost", 0)),
                tips=day_data.get("tips", []),
            )
        )

    return ItineraryResponse(
        trip_id=trip_id,
        destination=data.get("destination", destination),
        total_days=data.get("total_days", len(days)),
        total_estimated_cost=float(data.get("total_estimated_cost", 0)),
        currency=data.get("currency", "USD"),
        days=days,
        accommodation_suggestions=data.get("accommodation_suggestions", []),
        transport_tips=data.get("transport_tips", []),
        general_tips=data.get("general_tips", []),
    )


async def generate_itinerary(
    trip_id: str,
    destination: str,
    num_days: int,
    budget_level: str,
    travel_style: str,
    interests: list[str],
    group_size: int,
    group_type: str,
    start_date: Optional[str] = None,
) -> ItineraryResponse:
    prompt = _build_prompt(
        destination, num_days, budget_level, travel_style,
        interests, group_size, group_type, start_date
    )
    response_text = _call_gemini_api(prompt)
    return _parse_itinerary(response_text, trip_id, destination)


async def regenerate_day(
    trip_id: str,
    destination: str,
    day_number: int,
    budget_level: str,
    travel_style: str,
    interests: list[str],
    group_size: int,
    group_type: str,
) -> ItineraryDay:
    interests_str = ", ".join(interests) if interests else "general sightseeing"
    prompt = f"""You are an expert travel planner. Regenerate ONLY Day {day_number} of a trip to {destination}.

Traveler profile:
- Budget: {budget_level}
- Style: {travel_style}
- Interests: {interests_str}
- Group: {group_type} ({group_size} person{'s' if group_size > 1 else ''})

Return ONLY valid JSON (no markdown, no code fences) for a single day:
{{
  "day_number": {day_number},
  "date": "Day {day_number}",
  "theme": "Theme for the day",
  "total_day_cost": <number>,
  "tips": ["tip1"],
  "activities": [
    {{
      "time": "09:00 AM",
      "name": "Activity Name",
      "description": "Description",
      "location": "Location",
      "duration": "2 hours",
      "estimated_cost": <number>,
      "category": "attraction"
    }}
  ]
}}

Include 4-6 activities. Make it different from a typical Day {day_number} itinerary."""

    response_text = _call_gemini_api(prompt)
    cleaned = re.sub(r"```(?:json)?\s*|\s*```", "", response_text).strip()
    data = json.loads(cleaned)

    activities = [
        Activity(
            time=a.get("time", ""),
            name=a.get("name", ""),
            description=a.get("description", ""),
            location=a.get("location", ""),
            duration=a.get("duration", ""),
            estimated_cost=float(a.get("estimated_cost", 0)),
            category=a.get("category", "attraction"),
        )
        for a in data.get("activities", [])
    ]

    return ItineraryDay(
        day_number=data.get("day_number", day_number),
        date=data.get("date"),
        theme=data.get("theme", ""),
        activities=activities,
        total_day_cost=float(data.get("total_day_cost", 0)),
        tips=data.get("tips", []),
    )
