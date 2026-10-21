'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'
import styles from '../auth.module.css'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: name } },
      })
      if (authError) throw authError
      setSuccess(true)
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Signup failed')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className={styles.page}>
        <div className={styles.card} style={{ textAlign: 'center' }}>
          <span style={{ fontSize: '3rem' }}>🎉</span>
          <h2 style={{ marginTop: '12px' }}>Account created!</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '8px' }}>Redirecting to your dashboard…</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <div className={styles.bg}>
        <div className={styles.orb1} /><div className={styles.orb2} />
      </div>
      <div className={styles.card}>
        <Link href="/" className={styles.backLink}>← Back to home</Link>
        <div className={styles.header}>
          <span className={styles.logoIcon}>✈️</span>
          <h1>Create your account</h1>
          <p>Start planning smarter trips for free</p>
        </div>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleSignup} className={styles.form}>
          <div className="form-group">
            <label className="form-label" htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              className="form-input"
              placeholder="Jane Doe"
              value={name}
              onChange={e => setName(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              className="form-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              className="form-input"
              placeholder="Min. 8 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              minLength={8}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
            {loading ? <><span className="spinner" /> Creating account…</> : 'Create Account →'}
          </button>
        </form>
        <p className={styles.switchText}>
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
