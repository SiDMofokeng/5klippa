// client/src/components/AuthLayout.tsx
import type { ReactNode } from 'react';
import './AuthLayout.css'

type Props = {
  children: ReactNode
  activeTab: 'login' | 'register'
  onTabChange: (tab: 'login' | 'register') => void
}

export default function AuthLayout({ children, activeTab, onTabChange }: Props) {
  return (
    <div className="auth-page">
      <aside className="auth-page__aside">
        <div className="auth-brand">
          <div className="auth-logo">💲</div>
          <h1>5Klippa</h1>
        </div>
        <h2>Financial Freedom Starts Here</h2>
        <p className="auth-desc">
          Access affordable microloans and investment opportunities for a better financial future.
          Apply for loans, track repayments, and grow your investments all in one place.
        </p>
        <div className="auth-features">
          <div>
            <strong>Quick Loans</strong>
            <p>Get approved in minutes with minimal paperwork</p>
          </div>
          <div>
            <strong>Flexible Repayments</strong>
            <p>Choose terms that work with your income</p>
          </div>
          <div>
            <strong>P2P Marketplace</strong>
            <p>Invest in loans and earn competitive returns</p>
          </div>
          <div>
            <strong>Secure Platform</strong>
            <p>Advanced security for your financial data</p>
          </div>
        </div>
      </aside>

      <main className="auth-page__main">
        <div className="auth-card">
          <h2>Welcome to MicroLend</h2>
          <p className="auth-subtitle">Login or create an account to get started</p>

          <div className="auth-tabs">
            <button
              className={activeTab === 'login' ? 'active' : ''}
              onClick={() => onTabChange('login')}
            >
              Login
            </button>
            <button
              className={activeTab === 'register' ? 'active' : ''}
              onClick={() => onTabChange('register')}
            >
              Register
            </button>
          </div>

          <div className="auth-form">
            {children}

            <div className="auth-bottom-link">
              {activeTab === 'login' ? (
                <p>
                  Don’t have an account?
                  <button
                    className="link-button"
                    onClick={() => onTabChange('register')}
                  >
                    Register
                  </button>
                </p>
              ) : (
                <p>
                  Already have an account?
                  <button
                    className="link-button"
                    onClick={() => onTabChange('login')}
                  >
                    Log in
                  </button>
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
