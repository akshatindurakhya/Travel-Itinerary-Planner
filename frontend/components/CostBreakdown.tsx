'use client'
import type { ItineraryDay } from '@/lib/api'

interface CostBreakdownProps {
  days: ItineraryDay[]
}

export default function CostBreakdown({ days }: CostBreakdownProps) {
  const categoryTotals: Record<string, number> = {}
  let totalCost = 0

  for (const day of days) {
    for (const act of day.activities) {
      const cat = act.category ? act.category.toLowerCase() : 'other'
      const cost = Number(act.estimated_cost) || 0
      categoryTotals[cat] = (categoryTotals[cat] || 0) + cost
      totalCost += cost
    }
  }

  const categories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])

  return (
    <div className="card" style={{ flex: 1, minWidth: '280px', padding: '20px' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '14px', color: 'var(--text-primary)' }}>
        📊 Cost by Category
      </h3>

      {totalCost === 0 ? (
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          No cost estimates available.
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {categories.map(([cat, amount]) => {
            const percentage = totalCost > 0 ? Math.round((amount / totalCost) * 100) : 0
            return (
              <div key={cat}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.85rem',
                  marginBottom: '4px',
                  textTransform: 'capitalize'
                }}>
                  <span style={{ color: 'var(--text-secondary)' }}>{cat}</span>
                  <span style={{ fontWeight: 600 }}>${amount.toLocaleString()} ({percentage}%)</span>
                </div>
                <div style={{
                  width: '100%',
                  height: '6px',
                  backgroundColor: 'var(--bg-elevated)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    width: `${percentage}%`,
                    height: '100%',
                    background: 'linear-gradient(90deg, var(--accent-from), var(--accent-to))',
                    borderRadius: '3px'
                  }} />
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
