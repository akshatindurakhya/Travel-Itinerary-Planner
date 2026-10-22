# ✈️ Personalized Travel Itinerary Planner

An AI-powered, full-stack travel planning platform that simplifies trip organization through intelligent automation and personalized recommendations. Built with a modern **React/Next.js** frontend, a high-performance **FastAPI** backend, **Supabase** cloud database & authentication, and **Google Gemini Generative AI**.

---

## 🌐 Live Project Links

| Service | Link | Description |
| :--- | :--- | :--- |
| **Live Web App (Frontend)** | [https://travel-itinerary-planner-frontend-rose.vercel.app](https://travel-itinerary-planner-frontend-rose.vercel.app) | Production web application deployed on Vercel |
| **Source Code Repository** | [https://github.com/akshatindurakhya/Travel-Itinerary-Planner](https://github.com/akshatindurakhya/Travel-Itinerary-Planner) | Full project repository on GitHub |

---

## 📌 Problem Statement & Overview

Travel planning often leads to decision fatigue, requiring travelers to spend hours jumping between travel blogs, booking platforms, and map applications to structure a single trip.

The **Personalized Travel Itinerary Planner** solves this by:
1. Capturing user constraints: destination, budget tier, travel style, group size, and specific interests.
2. Generating a balanced, chronologically structured day-by-day plan using prompt-engineered Generative AI.
3. Providing real-time cost estimations, dining suggestions, accommodation recommendations, and local transit tips.
4. Allowing full flexibility to regenerate specific days or share read-only itineraries with travel companions.

---

## 👥 Supported Travel Scenarios

1. **Solo Traveler (Weekend Getaways)**: Quick generation of compact 2–3 day itineraries optimizing routes, highlighting affordable dining, and maximizing sightseeing efficiency.
2. **Couples (Vacations & Romantic Trips)**: Curated relaxed pacing, scenic viewpoints, intimate dining spots, and upscale accommodation recommendations.
3. **Small Groups & Families**: Coordinated multi-day scheduling combining varied interests (e.g. adventure, culture, nature) with group budget caps.

---

## 🛠️ Architecture & Tech Stack

### Frontend
- **Framework**: Next.js 14 (React, App Router, TypeScript)
- **Styling**: Vanilla CSS Modules with custom dark-mode design system & glassmorphism
- **Authentication**: Supabase Auth client (`@supabase/supabase-js`)
- **Icons**: Lucide Icons & Unicode emojis

### Backend
- **Framework**: FastAPI (Python 3.12)
- **Server**: Uvicorn ASGI
- **Data Validation**: Pydantic v2
- **AI Integration**: Google Generative AI (`google-generativeai`) using Gemini 1.5 Flash
- **Database Client**: Supabase Python SDK with PostgreSQL & Row-Level Security (RLS)

### Infrastructure & Cloud
- **Frontend Hosting**: Vercel (Edge CDN)
- **Backend Hosting**: Render (Linux Web Service)
- **Database & Auth**: Supabase Cloud PostgreSQL

---

## 📂 Repository Structure

This repository follows the required 8-phase project deliverable template:

```text
├── 1. Brainstorming & Ideation/          # Ideation, problem statements, empathy maps
├── 2. Requirement Analysis/              # Journey maps, data flow diagrams, solution specs
├── 3. Project Design Phase/              # Architecture diagrams, problem-solution fit
├── 4. Project Planning Phase/            # Project timelines and milestones
├── 5. Project Development Phase/         # Full-stack source code
│   ├── backend/                          # FastAPI REST API, Gemini service, Supabase schema
│   │   ├── main.py
│   │   ├── models/schemas.py
│   │   ├── routers/ (trips, itinerary, share)
│   │   ├── services/ (gemini_service, supabase_service)
│   │   ├── requirements.txt
│   │   └── supabase_schema.sql
│   └── frontend/                         # Next.js 14 web application
│       ├── app/ (landing, auth, dashboard, trip builder, itinerary view, public share)
│       ├── components/ (Navbar, TripCard, ItineraryDay, CostBreakdown)
│       └── lib/ (api client, supabase client)
├── 6.Project Testing/                    # Functional, API, and performance testing docs
├── 7.Project Documentation/              # Executable files & system manuals
├── 8.Project Demonstration/              # Demo video planning, scalability & future roadmap
├── frontend/                             # Root deployment copy for Vercel
└── README.md
```

---

## 🚀 Key Functional Features

- **Interactive 3-Step Trip Builder**: Capture destination, trip duration, budget category, travel style, and interest tags.
- **AI-Powered Day-by-Day Generation**: Detailed time-stamped schedule from morning to night.
- **Cost Analytics Breakdown**: Real-time aggregation of expenses across attractions, meals, and transport.
- **Single-Day & Full-Trip Regeneration**: Re-prompt AI to swap individual day plans while keeping the rest untouched.
- **Public Shareable Links**: Instant read-only tokens for friends to view itineraries without needing an account.
- **Secure Cloud Authentication**: User profiles and private trips protected by PostgreSQL Row-Level Security (RLS).

---

## ⚙️ Local Development Setup

### 1. Prerequisites
- **Node.js**: v18+ or v20+
- **Python**: v3.11 or v3.12
- Active **Google Gemini API Key** and **Supabase Project**

### 2. Backend Setup
```bash
cd "5. Project Development Phase/backend"

# Create virtual environment
python -m venv .venv
source .venv/bin/activate   # On Windows: .\.venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run the API server
uvicorn main:app --reload --port 8000
```
API Documentation will be available at `http://localhost:8000/docs`.

### 3. Frontend Setup
```bash
cd "5. Project Development Phase/frontend"

# Install dependencies
npm install

# Run the development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | Service health status check |
| `POST` | `/trips` | Create a new trip record |
| `GET` | `/trips` | Retrieve all trips for authenticated user |
| `GET` | `/trips/{id}` | Retrieve specific trip details |
| `DELETE` | `/trips/{id}` | Delete a trip |
| `POST` | `/itinerary/generate` | Generate AI itinerary for a trip |
| `GET` | `/itinerary/{trip_id}` | Retrieve generated itinerary |
| `POST` | `/itinerary/{trip_id}/regenerate` | Regenerate specific day or entire trip |
| `GET` | `/share/{token}` | Public read-only endpoint for shared trips |

---

## 📄 License
This project is developed as part of the AI/ML & Generative AI Track Project Deliverable.
