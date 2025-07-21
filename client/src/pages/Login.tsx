// client/src/pages/Login.tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import '../components/Form.css'

export default function Login() {
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError]       = useState<string|null>(null)
  const navigate = useNavigate()   // ← get the navigate function

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    const res = await fetch('http://localhost:3000/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    const data = await res.json()
    if (res.ok) {
      localStorage.setItem('token', data.session.access_token)
      navigate('/dashboard')        // ← redirect on success
    } else {
      setError(data.error || 'Login failed')
    }
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

      <div className="checkbox-group">
        <input
          type="checkbox"
          id="remember"
          checked={remember}
          onChange={e => setRemember(e.target.checked)}
        />
        <label htmlFor="remember">Remember me</label>
      </div>

      {error && (
        <p style={{ color: 'red', marginBottom: '1rem' }}>{error}</p>
      )}

      <div className="actions">
        <button type="submit" className="btn-primary">
          Log in
        </button>
      </div>
    </form>
  )
}
