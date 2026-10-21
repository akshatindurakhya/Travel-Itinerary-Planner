'use client'
import { Suspense, useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getTrip, getItinerary, regenerateItinerary, type Trip, type Itinerary } from '@/lib/api'
import Navbar from '@/components/Navbar'
import ItineraryDay from '@/components/ItineraryDay'
import CostBreakdown from '@/components/CostBreakdown'
import styles from './trip.module.css'

function TripContent() {
  const params = useParams()
  const router = useRouter()
  const tripId = params?.id as string
  const [userId, setUserId] = useState<string | null>(null)
  const [trip, setTrip] = useState<Trip | null>(null)
  const [itinerary, setItinerary] = useState<Itinerary | null>(null)
  const [loading, setLoading] = useState(true)
  const [regenerating, setRegenerating] = useState<number | 'all' | null>(null)
  const [copied, setCopied] = useState(false)
  const [activeDay, setActiveDay] = useState(1)

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUserId(session.user.id)
      try {
        const [t, it] = await Promise.all([
          getTrip(tripId, session.user.id),
          getItinerary(tripId, session.user.id),
        ])
        setTrip(t)
        setItinerary(it)
      } catch (e) {
        console.error(e)
      } finally {
        setLoading(false)
      }
    })
  }, [tripId, router])

  async function handleRegenerate(dayNum: number | null) {
    if (!userId) return
    setRegenerating(dayNum === null ? 'all' : dayNum)
    try {
      const updated = await regenerateItinerary(tripId, dayNum, userId)
      setItinerary(updated)
    } catch (e) { console.error(e) }
    finally { setRegenerating(null) }
  }

  function copyShareLink() {
    if (!trip?.share_token) return
    const url = `${window.location.origin}/share/${trip.share_token}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh' }}>
        <Navbar />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 'calc(100vh - 64px)' }}>
          <div><div className="spinner" style={{ width: 40, height: 40 }} /><p style={{ marginTop: 16, color: 'var(--text-secondary)' }}>Loading trip…</p></div>
        </div>
      </div>
    )
  }

  if (!trip || !itinerary) {
    return (
      <div style={{ minHeight: '100vh' }}><Navbar />
        <div style={{ textAlign: 'center', padding: '80px 24px' }}>
          <h2>Trip not found</h2>
          <Link href="/dashboard" className="btn btn-primary" style={{ marginTop: 16 }}>← Dashboard</Link>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <main className="container" style={{ paddingTop: 32, paddingBottom: 60 }}>
        {/* Header */}
        <div className={styles.header}>
          <Link href="/dashboard" className={styles.back}>← Dashboard</Link>
          <div className={styles.headerMain}>
            <div>
              <h1 className={styles.title}>{trip.title}</h1>
              <div className={styles.meta}>
                <span>📍 {trip.destination}</span>
                {trip.start_date && <span>📅 {trip.start_date}</span>}
                <span className={`badge badge-purple`}>{trip.budget_level}</span>
                <span className={`badge badge-teal`}>{trip.travel_style}</span>
                <span className={`badge badge-amber`}>{trip.group_type} · {trip.group_size}</span>
              </div>
            </div>
            <div className={styles.actions}>
              <button onClick={copyShareLink} className="btn btn-secondary btn-sm">
                {copied ? '✅ Copied!' : '🔗 Share Trip'}
              </button>
              <button
                onClick={() => handleRegenerate(null)}
                className="btn btn-secondary btn-sm"
                disabled={regenerating !== null}
              >
                {regenerating === 'all' ? <><span className="spinner" /> Regenerating…</> : '🔄 Regenerate All'}
              </button>
            </div>
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
              <div>
                <h2 className={styles.dayTitle}>Day {day.day_number} — {day.theme}</h2>
                <span className={styles.dayEstimate}>Est. ${day.total_day_cost.toLocaleString()}</span>
              </div>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => handleRegenerate(day.day_number)}
                disabled={regenerating !== null}
              >
                {regenerating === day.day_number ? <><span className="spinner" /> Regenerating…</> : '🔄 Regenerate Day'}
              </button>
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

        {/* General Info */}
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
          {itinerary.general_tips && itinerary.general_tips.length > 0 && (
            <div className="card">
              <h3>📝 General Tips</h3>
              <ul className={styles.infoList}>{itinerary.general_tips.map((t, i) => <li key={i}>{t}</li>)}</ul>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function TripPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="spinner" style={{ width: 40, height: 40 }} />
      </div>
    }>
      <TripContent />
    </Suspense>
  )
}
