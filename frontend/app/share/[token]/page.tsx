'use client'
import { Suspense, useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { getSharedTrip, type Trip, type Itinerary } from '@/lib/api'
import ItineraryDay from '@/components/ItineraryDay'
import CostBreakdown from '@/components/CostBreakdown'
import styles from './share.module.css'

function SharedTripContent() {
  const params = useParams()
  const token = params?.token as string

  const [trip, setTrip] = useState<Trip | null>(null)
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeDay, setActiveDay] = useState(1)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!token) return
    getSharedTrip(token)
      .then(res => {
        setTrip(res.trip)
        setItinerary(res.itinerary)
      })
      .catch(err => {
        setError(err instanceof Error ? err.message : 'Shared trip not found')
      })
      .finally(() => setLoading(false))
  }, [token])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ width: 40, height: 40 }} />
          <p style={{ marginTop: 16, color: 'var(--text-secondary)' }}>Loading shared itinerary…</p>
        </div>
      </div>
    )
  }

  if (error || !trip || !itinerary) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="card" style={{ textAlign: 'center', maxWidth: 400, padding: 32 }}>
          <span style={{ fontSize: '2.5rem' }}>🔍</span>
          <h2 style={{ marginTop: 12 }}>Trip Not Found</h2>
          <p style={{ color: 'var(--text-secondary)', margin: '8px 0 20px' }}>
            This shared trip link might be invalid or has expired.
          </p>
          <Link href="/" className="btn btn-primary">
            Plan a Trip on TripAI
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      {/* Top Banner */}
      <nav style={{
        background: 'rgba(14, 18, 32, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border)',
        padding: '12px 0'
      }}>
        <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800 }}>
            <span>✈️</span>
            <span className="gradient-text">TripAI</span>
          </Link>
          <Link href="/signup" className="btn btn-primary btn-sm">
            Create Your Own Trip →
          </Link>
        </div>
      </nav>

      <main className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        {/* Header */}
        <div className={styles.header}>
          <span className="badge badge-purple" style={{ marginBottom: 12 }}>Shared Itinerary</span>
          <h1 className={styles.title}>{trip.title}</h1>
          <div className={styles.meta}>
            <span>📍 {trip.destination}</span>
            {trip.start_date && <span>📅 {trip.start_date}</span>}
            <span className="badge badge-teal">{trip.travel_style}</span>
            <span className="badge badge-amber">{trip.budget_level}</span>
            <span className="badge badge-purple">{trip.group_type} · {trip.group_size}</span>
          </div>
        </div>

        {/* Cost Summary */}
        <div className={styles.costSummary}>
          <div className={`card ${styles.totalCost}`}>
            <span>💰 Estimated Total</span>
            <strong className="gradient-text">${itinerary.total_estimated_cost.toLocaleString()}</strong>
            <small>{itinerary.currency} · {itinerary.total_days} days</small>
          </div>
          <CostBreakdown days={itinerary.days} />
        </div>

        {/* Day Tabs */}
        <div className={styles.dayTabs}>
          {itinerary.days.map(d => (
            <button
              key={d.day_number}
              className={`${styles.dayTab} ${activeDay === d.day_number ? styles.activeTab : ''}`}
              onClick={() => setActiveDay(d.day_number)}
            >
              Day {d.day_number}
            </button>
          ))}
        </div>

        {/* Active Day */}
        {itinerary.days.filter(d => d.day_number === activeDay).map(day => (
          <div key={day.day_number} className="animate-fade-up">
            <div className={styles.dayHeader}>
              <h2 className={styles.dayTitle}>Day {day.day_number} — {day.theme}</h2>
              <span className={styles.dayEstimate}>Est. ${day.total_day_cost.toLocaleString()}</span>
            </div>
            <ItineraryDay day={day} />
            {day.tips && day.tips.length > 0 && (
              <div className={styles.tips}>
                <h3>💡 Tips for Day {day.day_number}</h3>
                <ul>{day.tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
              </div>
            )}
          </div>
        ))}

        {/* General Tips */}
        <div className={styles.infoGrid}>
          {itinerary.accommodation_suggestions && itinerary.accommodation_suggestions.length > 0 && (
            <div className="card">
              <h3>🏨 Accommodation Suggestions</h3>
              <ul className={styles.infoList}>{itinerary.accommodation_suggestions.map((s, i) => <li key={i}>{s}</li>)}</ul>
            </div>
          )}
          {itinerary.transport_tips && itinerary.transport_tips.length > 0 && (
            <div className="card">
              <h3>🚌 Transport Tips</h3>
              <ul className={styles.infoList}>{itinerary.transport_tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function SharedTripPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    }>
      <SharedTripContent />
    </Suspense>
  )
}
