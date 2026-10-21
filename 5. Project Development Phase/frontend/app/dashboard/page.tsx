'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import { getTrips, deleteTrip, type Trip } from '@/lib/api'
import TripCard from '@/components/TripCard'
import Navbar from '@/components/Navbar'
import styles from './dashboard.module.css'

export default function DashboardPage() {
  const router = useRouter()
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [userName, setUserName] = useState('')

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUserId(session.user.id)
      setUserName(session.user.user_metadata?.full_name || session.user.email || 'Traveler')
      getTrips(session.user.id)
        .then(setTrips)
        .catch(console.error)
        .finally(() => setLoading(false))
    })
  }, [router])

  async function handleDelete(id: string) {
    if (!userId) return
    await deleteTrip(id, userId)
    setTrips(prev => prev.filter(t => t.id !== id))
  }

  const destinations = new Set(trips.map(t => t.destination)).size

  return (
    <div className={styles.page}>
      <Navbar />
      <main className="container">
        {/* Header */}
        <div className={styles.pageHeader}>
          <div>
            <h1>Welcome back, {userName.split(' ')[0]} 👋</h1>
            <p className={styles.subtitle}>Manage your trips and plan new adventures</p>
          </div>
          <Link href="/trip/new" className="btn btn-primary">
            + Plan New Trip
          </Link>
        </div>

        {/* Stats */}
        <div className={styles.statsRow}>
          {[
            { label: 'Total Trips', value: trips.length, icon: '🗺️' },
            { label: 'Destinations', value: destinations, icon: '📍' },
            { label: 'Days Planned', value: trips.reduce((acc, t) => {
                if (!t.start_date || !t.end_date) return acc
                const diff = Math.abs(new Date(t.end_date).getTime() - new Date(t.start_date).getTime())
                return acc + Math.ceil(diff / (1000 * 60 * 60 * 24)) + 1
              }, 0), icon: '📅' },
          ].map(s => (
            <div key={s.label} className={`card ${styles.statCard}`}>
              <span className={styles.statIcon}>{s.icon}</span>
              <strong className={styles.statValue}>{s.value}</strong>
              <span className={styles.statLabel}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* Trips Grid */}
        <div className={styles.tripsHeader}>
          <h2>Your Trips</h2>
        </div>

        {loading ? (
          <div className={styles.grid}>
            {[1, 2, 3].map(i => (
              <div key={i} className={styles.skeletonCard}>
                <div className="skeleton" style={{ height: 160, borderRadius: 12 }} />
                <div className="skeleton" style={{ height: 20, marginTop: 12, width: '70%' }} />
                <div className="skeleton" style={{ height: 14, marginTop: 8, width: '50%' }} />
              </div>
            ))}
          </div>
        ) : trips.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>🌍</span>
            <h3>No trips yet</h3>
            <p>Start planning your first AI-powered adventure</p>
            <Link href="/trip/new" className="btn btn-primary" style={{ marginTop: '16px' }}>
              Plan Your First Trip →
            </Link>
          </div>
        ) : (
          <div className={styles.grid}>
            {trips.map(trip => (
              <TripCard key={trip.id} trip={trip} onDelete={handleDelete} />
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
