'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { createTrip, generateItinerary, type TripCreate } from '@/lib/api'
import Navbar from '@/components/Navbar'
import styles from './new.module.css'

const INTERESTS = ['🍜 Food', '🏛️ Culture', '🌿 Nature', '🎨 Art', '🛍️ Shopping', '🎭 Nightlife', '🏄 Adventure', '📸 Photography', '🕌 History', '🎵 Music', '🧘 Wellness', '⛷️ Sports']
const BUDGETS = [
  { value: 'economy', label: 'Economy', desc: 'Budget-friendly, hostels & street food', icon: '💚' },
  { value: 'moderate', label: 'Moderate', desc: 'Mid-range hotels & restaurants', icon: '💛' },
  { value: 'premium', label: 'Premium', desc: '4-star hotels & upscale dining', icon: '🧡' },
  { value: 'luxury', label: 'Luxury', desc: '5-star hotels & exclusive experiences', icon: '💜' },
]
const STYLES = [
  { value: 'adventure', label: 'Adventure', icon: '🏔️' },
  { value: 'cultural', label: 'Cultural', icon: '🏛️' },
  { value: 'relaxed', label: 'Relaxed', icon: '🌅' },
  { value: 'romantic', label: 'Romantic', icon: '💑' },
  { value: 'balanced', label: 'Balanced', icon: '⚖️' },
]
const GROUP_TYPES = [
  { value: 'solo', label: 'Solo', icon: '🧳' },
  { value: 'couple', label: 'Couple', icon: '💑' },
  { value: 'family', label: 'Family', icon: '👨‍👩‍👧‍👦' },
  { value: 'friends', label: 'Friends', icon: '👥' },
]

export default function NewTripPage() {
  const router = useRouter()
  const [userId, setUserId] = useState<string | null>(null)
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [form, setForm] = useState<TripCreate & { num_days: number }>({
    title: '',
    destination: '',
    start_date: '',
    end_date: '',
    budget_level: 'moderate',
    travel_style: 'balanced',
    interests: [],
    group_size: 1,
    group_type: 'solo',
    num_days: 3,
  })

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) { router.push('/login'); return }
      setUserId(session.user.id)
    })
  }, [router])

  function toggleInterest(interest: string) {
    setForm(f => ({
      ...f,
      interests: f.interests?.includes(interest)
        ? f.interests.filter(i => i !== interest)
        : [...(f.interests || []), interest],
    }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!userId) return
    setLoading(true)
    setError('')
    try {
      const { num_days, ...tripData } = form
      const trip = await createTrip(tripData, userId)
      await generateItinerary({
        trip_id: trip.id,
        destination: form.destination,
        start_date: form.start_date,
        end_date: form.end_date,
        budget_level: form.budget_level || 'moderate',
        travel_style: form.travel_style || 'balanced',
        interests: form.interests || [],
        group_size: form.group_size || 1,
        group_type: form.group_type || 'solo',
        num_days,
      }, userId)
      router.push(`/trip/${trip.id}`)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <Navbar />
        <div className={styles.loadingContent}>
          <div className={styles.loadingOrb} />
          <div className={styles.spinner} />
          <h2>Generating your itinerary…</h2>
          <p>Our AI is crafting your perfect trip to <strong>{form.destination}</strong></p>
          <div className={styles.loadingSteps}>
            {['Researching destination', 'Planning activities', 'Curating dining options', 'Estimating costs'].map((s, i) => (
              <div key={s} className={styles.loadingStep} style={{ animationDelay: `${i * 0.4}s` }}>
                <span className={styles.loadingDot} /> {s}
              </div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Navbar />
      <div className="container-sm" style={{ paddingTop: '36px', paddingBottom: '60px' }}>
        {/* Progress */}
        <div className={styles.progress}>
          {[1, 2, 3].map(n => (
            <div key={n} className={`${styles.step} ${step >= n ? styles.stepActive : ''}`}>
              <div className={styles.stepNum}>{step > n ? '✓' : n}</div>
              <span>{n === 1 ? 'Destination' : n === 2 ? 'Preferences' : 'Finalize'}</span>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit}>
          {/* ── Step 1: Basics ── */}
          {step === 1 && (
            <div className={`card ${styles.formCard} animate-fade-up`}>
              <h2 className={styles.stepTitle}>🗺️ Where are you headed?</h2>
              <div className={styles.formSection}>
                <div className="form-group">
                  <label className="form-label" htmlFor="title">Trip Name</label>
                  <input id="title" className="form-input" placeholder="e.g. Summer Paris Adventure" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="dest">Destination</label>
                  <input id="dest" className="form-input" placeholder="e.g. Paris, France" value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} required />
                </div>
                <div className={styles.dateRow}>
                  <div className="form-group">
                    <label className="form-label" htmlFor="start">Start Date</label>
                    <input id="start" type="date" className="form-input" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
                  </div>
                  <div className="form-group">
                    <label className="form-label" htmlFor="end">End Date</label>
                    <input id="end" type="date" className="form-input" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="days">Number of Days</label>
                  <input id="days" type="number" className="form-input" min={1} max={14} value={form.num_days} onChange={e => setForm(f => ({ ...f, num_days: parseInt(e.target.value) || 3 }))} required />
                </div>
              </div>
              <button type="button" className="btn btn-primary" style={{ width: '100%' }}
                disabled={!form.title || !form.destination}
                onClick={() => setStep(2)}>Continue →</button>
            </div>
          )}

          {/* ── Step 2: Preferences ── */}
          {step === 2 && (
            <div className={`card ${styles.formCard} animate-fade-up`}>
              <h2 className={styles.stepTitle}>✨ Personalize your trip</h2>
              <div className={styles.formSection}>
                <div>
                  <label className="form-label">Budget Level</label>
                  <div className={styles.optionGrid}>
                    {BUDGETS.map(b => (
                      <button key={b.value} type="button"
                        className={`${styles.optionCard} ${form.budget_level === b.value ? styles.selected : ''}`}
                        onClick={() => setForm(f => ({ ...f, budget_level: b.value }))}>
                        <span>{b.icon}</span>
                        <strong>{b.label}</strong>
                        <small>{b.desc}</small>
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="form-label">Travel Style</label>
                  <div className={styles.styleGrid}>
                    {STYLES.map(s => (
                      <button key={s.value} type="button"
                        className={`${styles.styleChip} ${form.travel_style === s.value ? styles.selected : ''}`}
                        onClick={() => setForm(f => ({ ...f, travel_style: s.value }))}>
                        {s.icon} {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="form-label">Interests (select all that apply)</label>
                  <div className={styles.interestGrid}>
                    {INTERESTS.map(i => (
                      <button key={i} type="button"
                        className={`chip ${form.interests?.includes(i) ? 'selected' : ''}`}
                        onClick={() => toggleInterest(i)}>{i}</button>
                    ))}
                  </div>
                </div>
              </div>
              <div className={styles.btnRow}>
                <button type="button" className="btn btn-secondary" onClick={() => setStep(1)}>← Back</button>
                <button type="button" className="btn btn-primary" onClick={() => setStep(3)}>Continue →</button>
              </div>
            </div>
          )}

          {/* ── Step 3: Group ── */}
          {step === 3 && (
            <div className={`card ${styles.formCard} animate-fade-up`}>
              <h2 className={styles.stepTitle}>👥 Who&apos;s traveling?</h2>
              <div className={styles.formSection}>
                <div>
                  <label className="form-label">Group Type</label>
                  <div className={styles.styleGrid}>
                    {GROUP_TYPES.map(g => (
                      <button key={g.value} type="button"
                        className={`${styles.styleChip} ${form.group_type === g.value ? styles.selected : ''}`}
                        onClick={() => setForm(f => ({ ...f, group_type: g.value }))}>
                        {g.icon} {g.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label" htmlFor="groupsize">Number of Travelers</label>
                  <input id="groupsize" type="number" className="form-input" min={1} max={20}
                    value={form.group_size} onChange={e => setForm(f => ({ ...f, group_size: parseInt(e.target.value) || 1 }))} />
                </div>
                {/* Summary */}
                <div className={styles.summary}>
                  <h3>📋 Trip Summary</h3>
                  <div className={styles.summaryGrid}>
                    <div><span>Destination</span><strong>{form.destination}</strong></div>
                    <div><span>Duration</span><strong>{form.num_days} days</strong></div>
                    <div><span>Budget</span><strong className="gradient-text">{form.budget_level}</strong></div>
                    <div><span>Style</span><strong>{form.travel_style}</strong></div>
                    <div><span>Group</span><strong>{form.group_type} · {form.group_size} person{form.group_size !== 1 ? 's' : ''}</strong></div>
                    <div><span>Interests</span><strong>{form.interests?.length || 0} selected</strong></div>
                  </div>
                </div>
                {error && <div style={{ background: 'hsl(0,70%,45%,0.15)', border: '1px solid hsl(0,70%,45%,0.4)', color: 'hsl(0,70%,70%)', borderRadius: '8px', padding: '10px 14px', fontSize: '0.87rem' }}>{error}</div>}
              </div>
              <div className={styles.btnRow}>
                <button type="button" className="btn btn-secondary" onClick={() => setStep(2)}>← Back</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  🚀 Generate Itinerary
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
