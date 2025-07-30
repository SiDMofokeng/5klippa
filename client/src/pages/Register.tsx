// client/src/pages/Register.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../components/Form.css'

export default function Register() {
  const API = import.meta.env.VITE_API_URL

  const [email, setEmail]       = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [referral, setReferral] = useState('')
  const [error, setError]       = useState<string|null>(null)
  const [success, setSuccess]   = useState(false)
  const navigate = useNavigate()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const res = await fetch(`${API}/api/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email,
        username,
        password,
        referral_code: referral
      })
    })
    const data = await res.json()

    if (res.ok) {
      setSuccess(true)
    } else {
      setError(data.error || 'Registration failed')
    }
  }

  if (success) {
    return (
      <div className="auth-form">
        <p style={{ color: 'green', textAlign: 'center', marginBottom: '1rem' }}>
          Registration successful! Please log in below.
        </p>
        <div className="actions">
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate('/auth?tab=login')}
          >
            Go to Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="auth-form">
      <div className="form-group">
        <label>Email</label>
        <div className="input-wrapper">
          <span className="icon">📧</span>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Username</label>
        <div className="input-wrapper">
          <span className="icon">👤</span>
          <input
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Password</label>
        <div className="input-wrapper">
          <span className="icon">🔒</span>
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="form-group">
        <label>Referral Code</label>
        <div className="input-wrapper">
          <span className="icon">🔖</span>
          <input
            value={referral}
            onChange={e => setReferral(e.target.value)}
            required
          />
        </div>
      </div>

      {error && (
        <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>
      )}

      <div className="actions">
        <button type="submit" className="btn-primary">
          Register
        </button>
      </div>
    </form>
  )
}
