// client/src/App.tsx
import { Routes, Route, Navigate } from 'react-router-dom'
import AuthPage  from './AuthPage'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <Routes>
      {/* Redirect root to auth login */}
      <Route path="/" element={<Navigate to="/auth?tab=login" replace />} />

      {/* Primary auth URL */}
      <Route path="/auth" element={<AuthPage />} />

      {/* (Optional) Aliases if someone hits these directly */}
      <Route path="/login"    element={<Navigate to="/auth?tab=login" replace />} />
      <Route path="/register" element={<Navigate to="/auth?tab=register" replace />} />

      {/* Protected routes */}
      <Route path="/dashboard" element={<Dashboard />} />

      {/* Fallback */}
      <Route path="*" element={<p>Page not found</p>} />
    </Routes>
  )
}
