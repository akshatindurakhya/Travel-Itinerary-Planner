'use client'
import type { ItineraryDay as ItineraryDayType, Activity } from '@/lib/api'

interface ItineraryDayProps {
  day: ItineraryDayType
}

const CATEGORY_COLORS: Record<string, { badge: string; icon: string }> = {
  attraction: { badge: 'badge-purple', icon: '🏛️' },
  dining: { badge: 'badge-amber', icon: '🍜' },
  transport: { badge: 'badge-teal', icon: '🚌' },
  accommodation: { badge: 'badge-rose', icon: '🏨' },
  leisure: { badge: 'badge-purple', icon: '🌿' },
}

export default function ItineraryDay({ day }: ItineraryDayProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '20px 0' }}>
      {day.activities.map((activity: Activity, idx: number) => {
        const catKey = activity.category?.toLowerCase() || 'attraction'
        const meta = CATEGORY_COLORS[catKey] || { badge: 'badge-purple', icon: '📍' }

        return (
          <div
            key={idx}
            className="card"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
              padding: '20px',
              position: 'relative',
              borderLeft: '4px solid var(--accent-from)',
              background: 'var(--bg-elevated)'
            }}
          >
            {/* Header: Time, Category, Cost */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '8px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  fontWeight: 700,
                  fontSize: '0.9rem',
                  color: 'hsl(250, 84%, 80%)'
                }}>
                  ⏰ {activity.time}
                </span>
                <span className={`badge ${meta.badge}`} style={{ textTransform: 'capitalize' }}>
                  {meta.icon} {activity.category || 'Sightseeing'}
                </span>
                {activity.duration && (
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    ⏳ {activity.duration}
                  </span>
                )}
              </div>

              {activity.estimated_cost !== undefined && (
                <span style={{
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  color: 'hsl(38, 95%, 70%)'
                }}>
                  {activity.estimated_cost > 0 ? `$${activity.estimated_cost}` : 'Free'}
                </span>
              )}
            </div>

            {/* Name & Location */}
            <div>
              <h4 style={{ fontSize: '1.1rem', marginBottom: '4px', color: 'var(--text-primary)' }}>
                {activity.name}
              </h4>
              {activity.location && (
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                  📍 {activity.location}
                </p>
              )}
              <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {activity.description}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
