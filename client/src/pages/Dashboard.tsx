// client/src/pages/Dashboard.tsx
import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

// Pull in your base API URL from Vite env:
const API = import.meta.env.VITE_API_URL

type User = {
  id: string
  email: string
  username: string
  onboarding_status: 'pending_profile' | 'pending_kyc' | 'under_review' | 'completed'
}

type Loan = {
  id: string
  amount: number
  term_months: number
  purpose: string
  status: 'approved' | 'pending' | 'rejected'
  created_at: string
}

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null)
  const [loans, setLoans] = useState<Loan[]>([])
  const nav = useNavigate()

  // 1️⃣ Fetch current user
  useEffect(() => {
    const token = localStorage.getItem('token')
    fetch(`${API}/api/me`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        if (!res.ok) throw new Error('Unauthorized')
        return res.json()
      })
      .then(data => setUser(data.user))
      .catch(() => nav('/auth?tab=login'))
  }, [nav])

  // 2️⃣ Fetch loans once user is loaded
  useEffect(() => {
    if (!user) return
    const token = localStorage.getItem('token')
    fetch(`${API}/api/loans`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setLoans(data.loans || []))
      .catch(console.error)
  }, [user])

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        Loading…
      </div>
    )
  }

  // Calculate onboarding progress
  const steps = ['pending_profile','pending_kyc','under_review','completed'] as const
  const pct = ((steps.indexOf(user.onboarding_status) + 1) / steps.length) * 100

  return (
    <div className="h-screen grid grid-cols-4 bg-gray-100">
      {/* ─── SIDEBAR ────────────────────────────────────── */}
      <aside
        className="col-span-1 px-6 py-8 flex flex-col justify-between text-white"
        style={{
          background: 'linear-gradient(180deg, #1d4ed8 0%, #3b82f6 100%)'
        }}
      >
        <div>
          <h2 className="text-3xl font-bold mb-6">5Klippa</h2>
          <p className="mb-8">
            Welcome, <strong>{user.username}</strong>
          </p>
          <nav className="space-y-2">
            <button
              onClick={() => nav('/auth?tab=register')}
              className="block w-full text-left px-4 py-2 rounded hover:bg-blue-500/20 transition"
            >
              Onboarding
            </button>
            <button
              onClick={() => nav('/loans')}
              className="block w-full text-left px-4 py-2 rounded hover:bg-blue-500/20 transition"
            >
              Loans
            </button>
            <button
              onClick={() => nav('/payments')}
              className="block w-full text-left px-4 py-2 rounded hover:bg-blue-500/20 transition"
            >
              Payments
            </button>
          </nav>
        </div>
        <div className="space-y-2">
          <button
            onClick={() => nav('/profile')}
            className="block w-full text-left px-4 py-2 rounded hover:bg-blue-500/20 transition"
          >
            Profile Settings
          </button>
          <button
            onClick={() => {
              localStorage.removeItem('token')
              nav('/auth?tab=login')
            }}
            className="block w-full text-left px-4 py-2 rounded text-red-200 hover:bg-red-500/20 transition"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* ─── MAIN ───────────────────────────────────────── */}
      <main className="col-span-3 overflow-auto">
        <div className="max-w-7xl mx-auto px-8 py-10 space-y-8">
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>

          {/* Onboarding Progress */}
          <section className="bg-white rounded-2xl shadow-md p-6 space-y-4 border-l-8 border-blue-600 transition hover:shadow-lg">
            <h2 className="text-2xl font-semibold text-blue-600">
              Onboarding Progress
            </h2>
            <div className="w-full bg-blue-100 rounded-full h-3">
              <div
                className="bg-blue-600 h-3 rounded-full"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-gray-700">
              Status:{' '}
              <span className="font-medium capitalize">
                {user.onboarding_status.replace('_', ' ')}
              </span>
            </p>
            {user.onboarding_status !== 'completed' && (
              <button
                onClick={() => nav('/profile')}
                className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition"
              >
                Continue Onboarding
              </button>
            )}
          </section>

          {/* Summary Widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <section className="bg-blue-50 rounded-2xl shadow-md p-6 border-l-4 border-blue-400 hover:shadow-lg transition">
              <p className="text-sm text-blue-600">Total Outstanding</p>
              <p className="mt-2 text-2xl font-semibold text-blue-900">
                R{loans.reduce((sum, l) => sum + l.amount, 0).toFixed(2)}
              </p>
            </section>
            <section className="bg-green-50 rounded-2xl shadow-md p-6 border-l-4 border-green-400 hover:shadow-lg transition">
              <p className="text-sm text-green-600">Next Payment Due</p>
              <p className="mt-2 text-2xl font-semibold text-green-900">
                {loans.length === 0
                  ? 'N/A'
                  : new Date(loans[0].created_at).toLocaleDateString()}
              </p>
            </section>
          </div>

          {/* Active Loans */}
          <section className="bg-white rounded-2xl shadow-md p-6 space-y-4 hover:shadow-lg transition">
            <h2 className="text-2xl font-semibold text-gray-800">
              Your Active Loans
            </h2>
            {loans.length === 0 ? (
              <p className="text-gray-600">You have no active loans.</p>
            ) : (
              <ul className="space-y-4">
                {loans.map(loan => (
                  <li
                    key={loan.id}
                    className="border border-gray-200 rounded-lg p-4 flex justify-between items-center hover:shadow-sm transition"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        R{loan.amount.toFixed(2)}
                      </p>
                      <p className="text-gray-600">
                        Term: {loan.term_months} months
                      </p>
                      <p className="text-gray-600">Purpose: {loan.purpose}</p>
                      <p className="text-sm text-gray-500">
                        Requested on {new Date(loan.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`
                        px-3 py-1 rounded-full text-sm font-medium
                        ${loan.status === 'approved' ? 'bg-green-100 text-green-800' : ''}
                        ${loan.status === 'pending'  ? 'bg-yellow-100 text-yellow-800' : ''}
                        ${loan.status === 'rejected' ? 'bg-red-100 text-red-800' : ''}
                      `}
                    >
                      {loan.status}
                    </span>
                  </li>
                ))}
              </ul>
            )}
            {user.onboarding_status === 'completed' && (
              <button
                onClick={() => nav('/apply')}
                className="mt-4 px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
              >
                Apply for a Loan
              </button>
            )}
          </section>
        </div>
      </main>
    </div>
  )
}
