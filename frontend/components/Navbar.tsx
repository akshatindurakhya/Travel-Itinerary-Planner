'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'

export default function Navbar() {
  const router = useRouter()
  const [userEmail, setUserEmail] = useState<string | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserEmail(session.user.email || null)
      }
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email || null)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <nav style={{
      position: 'sticky',
      top: 0,
      zIndex: 50,
      background: 'rgba(14, 18, 32, 0.85)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid var(--border)'
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '64px'
      }}>
        {/* Brand */}
        <Link href="/dashboard" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontSize: '1.25rem',
          fontWeight: 800
        }}>
          <span>✈️</span>
          <span className="gradient-text">TripAI</span>
        </Link>

        {/* Links & Profile */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/dashboard" className="btn btn-ghost btn-sm">
            Dashboard
          </Link>
          <Link href="/trip/new" className="btn btn-primary btn-sm">
            + New Trip
          </Link>

          {userEmail && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginLeft: '8px' }}>
              <span style={{
                fontSize: '0.82rem',
                color: 'var(--text-secondary)',
                maxWidth: '160px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {userEmail}
              </span>
              <button
                onClick={handleLogout}
                className="btn btn-secondary btn-sm"
                title="Log out"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}
