'use client'
import Link from 'next/link'
import { useState } from 'react'
import type { Trip } from '@/lib/api'

interface TripCardProps {
  trip: Trip
  onDelete: (id: string) => void
}

export default function TripCard({ trip, onDelete }: TripCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)

  const formattedDate = trip.start_date
    ? new Date(trip.start_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : 'Upcoming'

  async function handleDeleteClick(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (confirm(`Are you sure you want to delete "${trip.title}"?`)) {
      setIsDeleting(true)
      try {
        await onDelete(trip.id)
      } finally {
        setIsDeleting(false)
      }
    }
  }

  return (
    <div className="card" style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      position: 'relative',
      height: '100%',
      transition: 'var(--transition)'
    }}>
      <div>
        {/* Top badges */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span className="badge badge-purple" style={{ textTransform: 'capitalize' }}>
            {trip.travel_style || 'Balanced'}
          </span>
          {trip.budget_level && (
            <span className="badge badge-amber" style={{ textTransform: 'capitalize' }}>
              {trip.budget_level}
            </span>
          )}
        </div>

        {/* Title & destination */}
        <h3 style={{ fontSize: '1.2rem', marginBottom: '6px', color: 'var(--text-primary)' }}>
          {trip.title}
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span>📍</span> {trip.destination}
        </p>

        {/* Details snippet */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '0.8rem',
          color: 'var(--text-muted)',
          marginBottom: '20px'
        }}>
          <span>📅 {formattedDate}</span>
          <span>•</span>
          <span>👥 {trip.group_size || 1} {trip.group_type || 'Traveler'}</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: '16px',
        borderTop: '1px solid var(--border)'
      }}>
        <Link href={`/trip/${trip.id}`} className="btn btn-primary btn-sm">
          View Itinerary →
        </Link>
        <button
          onClick={handleDeleteClick}
          disabled={isDeleting}
          className="btn btn-ghost btn-sm"
          style={{ color: 'hsl(0, 70%, 70%)' }}
          title="Delete trip"
        >
          {isDeleting ? '…' : '🗑️'}
        </button>
      </div>
    </div>
  )
}
