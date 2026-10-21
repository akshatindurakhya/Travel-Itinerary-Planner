-- ============================================================
-- Personalized Travel Itinerary Planner — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Enable uuid extension (usually already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Trips table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS trips (
  id            UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id       UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  title         TEXT NOT NULL,
  destination   TEXT NOT NULL,
  start_date    DATE,
  end_date      DATE,
  budget_level  TEXT DEFAULT 'moderate',
  travel_style  TEXT DEFAULT 'balanced',
  interests     TEXT[] DEFAULT '{}',
  group_size    INTEGER DEFAULT 1,
  group_type    TEXT DEFAULT 'solo',
  share_token   TEXT UNIQUE DEFAULT encode(gen_random_bytes(12), 'hex'),
  created_at    TIMESTAMPTZ DEFAULT NOW(),
  updated_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── Itineraries table ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS itineraries (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  trip_id         UUID REFERENCES trips(id) ON DELETE CASCADE UNIQUE,
  content         JSONB,
  estimated_cost  NUMERIC DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── Auto-update updated_at trigger ───────────────────────────
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER trips_updated_at
  BEFORE UPDATE ON trips
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ── Row Level Security ────────────────────────────────────────
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE itineraries ENABLE ROW LEVEL SECURITY;

-- Trips: users can only see/modify their own trips
CREATE POLICY "Users can view own trips"
  ON trips FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own trips"
  ON trips FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own trips"
  ON trips FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own trips"
  ON trips FOR DELETE USING (auth.uid() = user_id);

-- Public share access (no auth required)
CREATE POLICY "Public can view shared trips"
  ON trips FOR SELECT USING (share_token IS NOT NULL);

-- Itineraries: accessible if you own the trip
CREATE POLICY "Users can view own itineraries"
  ON itineraries FOR SELECT
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can insert own itineraries"
  ON itineraries FOR INSERT
  WITH CHECK (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

CREATE POLICY "Users can update own itineraries"
  ON itineraries FOR UPDATE
  USING (trip_id IN (SELECT id FROM trips WHERE user_id = auth.uid()));

-- Public itinerary access via share token
CREATE POLICY "Public can view shared itineraries"
  ON itineraries FOR SELECT
  USING (trip_id IN (SELECT id FROM trips WHERE share_token IS NOT NULL));
