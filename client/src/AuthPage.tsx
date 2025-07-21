// client/src/AuthPage.tsx
import { useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from './components/AuthLayout'
import LoginForm  from './pages/Login'
import RegForm    from './pages/Register'

export default function AuthPage() {
  const { search } = useLocation()
  const nav        = useNavigate()
  const params     = new URLSearchParams(search)
  const tabParam   = params.get('tab')
  const activeTab  = tabParam === 'register' ? 'register' : 'login'

  function onTabChange(t: 'login' | 'register') {
    nav(`/auth?tab=${t}`, { replace: true })
  }

  return (
    <AuthLayout activeTab={activeTab} onTabChange={onTabChange}>
      {activeTab === 'login' ? <LoginForm /> : <RegForm />}
    </AuthLayout>
  )
}
