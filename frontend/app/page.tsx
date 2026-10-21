'use client'
import Link from 'next/link'
import styles from './page.module.css'

const features = [
  { icon: '🤖', title: 'AI-Powered Planning', desc: 'Gemini AI generates detailed, personalized itineraries in seconds based on your unique preferences.' },
  { icon: '📅', title: 'Day-by-Day Structure', desc: 'Get a clear, organized schedule for each day with timed activities, dining spots, and transport tips.' },
  { icon: '💰', title: 'Smart Budgeting', desc: 'Real-time cost estimates per activity and per day help you plan within your budget effortlessly.' },
  { icon: '🔗', title: 'Shareable Trips', desc: 'Share your itinerary with travel companions via a simple link — no account needed to view.' },
  { icon: '🔄', title: 'Instant Regeneration', desc: 'Not happy with a day\'s plan? Regenerate any single day or the entire trip with one click.' },
  { icon: '💾', title: 'Save & Manage', desc: 'Store all your trips in your personal dashboard. Edit, revisit, or build on previous itineraries.' },
]

const scenarios = [
  { emoji: '🧳', label: 'Solo Traveler', desc: 'Quick weekend getaways with optimized routes and budget-friendly picks.' },
  { emoji: '💑', label: 'Couples', desc: 'Romantic experiences, scenic spots, and curated intimate dining options.' },
  { emoji: '👨‍👩‍👧‍👦', label: 'Groups', desc: 'Coordinated multi-day plans that satisfy everyone\'s interests and budget.' },
]

export default function LandingPage() {
  return (
    <div className={styles.page}>
      {/* ── Navbar ── */}
      <nav className={styles.nav}>
        <div className={`container ${styles.navInner}`}>
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>✈️</span>
            <span className="gradient-text">TripAI</span>
          </Link>
          <div className={styles.navActions}>
            <Link href="/login" className="btn btn-ghost btn-sm">Sign In</Link>
            <Link href="/signup" className="btn btn-primary btn-sm">Get Started Free</Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className={styles.hero}>
        <div className={styles.heroBg} aria-hidden="true">
          <div className={styles.orb1} />
          <div className={styles.orb2} />
          <div className={styles.orb3} />
        </div>
        <div className={`container ${styles.heroContent}`}>
          <span className={`badge badge-purple ${styles.heroBadge}`}>✨ Powered by Google Gemini AI</span>
          <h1 className={styles.heroTitle}>
            Your perfect trip,<br />
            <span className="gradient-text">planned in seconds</span>
          </h1>
          <p className={styles.heroSub}>
            Stop spending hours researching. TripAI generates personalized day-by-day itineraries with attractions, dining, and costs — tailored exactly to you.
          </p>
          <div className={styles.heroActions}>
            <Link href="/signup" className="btn btn-primary btn-lg">
              Start Planning for Free →
            </Link>
            <Link href="/login" className="btn btn-secondary btn-lg">
              Sign In
            </Link>
          </div>
          <div className={styles.heroStats}>
            <div className={styles.stat}><strong>10s</strong><span>to generate</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><strong>AI</strong><span>personalized</span></div>
            <div className={styles.statDivider} />
            <div className={styles.stat}><strong>Free</strong><span>to start</span></div>
          </div>
        </div>
      </section>

      {/* ── Scenarios ── */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Built for every kind of traveler</h2>
            <p>Whether you&apos;re going solo or coordinating a group trip, TripAI adapts to your needs.</p>
          </div>
          <div className={styles.scenarioGrid}>
            {scenarios.map(s => (
              <div key={s.label} className={`card ${styles.scenarioCard}`}>
                <span className={styles.scenarioEmoji}>{s.emoji}</span>
                <h3>{s.label}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className={styles.section}>
        <div className="container">
          <div className={styles.sectionHeader}>
            <h2>Everything you need to plan confidently</h2>
            <p>Powerful features that eliminate travel planning complexity.</p>
          </div>
          <div className={styles.featureGrid}>
            {features.map(f => (
              <div key={f.title} className={`card ${styles.featureCard}`}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className={styles.ctaSection}>
        <div className="container">
          <div className={`glass ${styles.ctaBox}`}>
            <h2>Ready to plan your next adventure?</h2>
            <p>Join travelers who plan smarter with AI. No credit card required.</p>
            <Link href="/signup" className="btn btn-primary btn-lg">
              Create Your Free Account →
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className={styles.footer}>
        <div className="container">
          <p>© 2026 TripAI · Built with Google Gemini AI</p>
        </div>
      </footer>
    </div>
  )
}
