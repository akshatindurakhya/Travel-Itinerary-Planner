import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'TripAI — Personalized Travel Itinerary Planner',
  description: 'Plan your perfect trip with AI. Get personalized day-by-day itineraries, curated recommendations, and smart budgeting — all in seconds.',
  keywords: 'travel planner, AI itinerary, trip planning, personalized travel, vacation planner',
  openGraph: {
    title: 'TripAI — Personalized Travel Itinerary Planner',
    description: 'AI-powered travel planning made simple.',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
