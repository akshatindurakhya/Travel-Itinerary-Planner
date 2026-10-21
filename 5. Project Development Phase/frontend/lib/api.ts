const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

async function request<T>(path: string, options: RequestInit = {}, userId?: string): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  if (userId) headers['X-User-Id'] = userId

  const res = await fetch(`${API_URL}${path}`, { ...options, headers })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }))
    throw new Error(err.detail || 'Request failed')
  }
  return res.json()
}

// ── Trips ─────────────────────────────────────────────────────

export interface Trip {
  id: string
  user_id?: string
  title: string
  destination: string
  start_date?: string
  end_date?: string
  budget_level?: string
  travel_style?: string
  interests?: string[]
  group_size?: number
  group_type?: string
  share_token?: string
  created_at?: string
  updated_at?: string
}

export interface TripCreate {
  title: string
  destination: string
  start_date?: string
  end_date?: string
  budget_level?: string
  travel_style?: string
  interests?: string[]
  group_size?: number
  group_type?: string
}

export const createTrip = (data: TripCreate, userId: string) =>
  request<Trip>('/trips', { method: 'POST', body: JSON.stringify(data) }, userId)

export const getTrips = (userId: string) =>
  request<Trip[]>('/trips', {}, userId)

export const getTrip = (id: string, userId: string) =>
  request<Trip>(`/trips/${id}`, {}, userId)

export const updateTrip = (id: string, data: Partial<TripCreate>, userId: string) =>
  request<Trip>(`/trips/${id}`, { method: 'PUT', body: JSON.stringify(data) }, userId)

export const deleteTrip = (id: string, userId: string) =>
  request<{ message: string }>(`/trips/${id}`, { method: 'DELETE' }, userId)

// ── Itinerary ──────────────────────────────────────────────────

export interface Activity {
  time: string
  name: string
  description: string
  location: string
  duration: string
  estimated_cost: number
  category: string
}

export interface ItineraryDay {
  day_number: number
  date?: string
  theme: string
  activities: Activity[]
  total_day_cost: number
  tips?: string[]
}

export interface Itinerary {
  trip_id: string
  destination: string
  total_days: number
  total_estimated_cost: number
  currency: string
  days: ItineraryDay[]
  accommodation_suggestions?: string[]
  transport_tips?: string[]
  general_tips?: string[]
}

export interface GenerateRequest {
  trip_id: string
  destination: string
  start_date?: string
  end_date?: string
  budget_level: string
  travel_style: string
  interests: string[]
  group_size: number
  group_type: string
  num_days: number
}

export const generateItinerary = (data: GenerateRequest, userId: string) =>
  request<Itinerary>('/itinerary/generate', { method: 'POST', body: JSON.stringify(data) }, userId)

export const getItinerary = (tripId: string, userId: string) =>
  request<Itinerary>(`/itinerary/${tripId}`, {}, userId)

export const regenerateItinerary = (tripId: string, dayNumber: number | null, userId: string) =>
  request<Itinerary>(`/itinerary/${tripId}/regenerate`, {
    method: 'POST',
    body: JSON.stringify({ day_number: dayNumber }),
  }, userId)

// ── Share ──────────────────────────────────────────────────────

export const getSharedTrip = (token: string) =>
  request<{ trip: Trip; itinerary: Itinerary | null }>(`/share/${token}`)
