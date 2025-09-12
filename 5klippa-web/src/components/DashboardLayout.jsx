// 5klippa-web/src/components/DashboardLayout.jsx
import React, { useEffect, useState, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { SIDEBAR_W, CONTENT_MAX_W } from '../ui/constants';

export default function DashboardLayout({ children }) {
  const nav = useNavigate();
  const { pathname } = useLocation();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const off = onAuthStateChanged(auth, (u) => setUser(u || null));
    return () => off();
  }, []);


  const LEFT_W = 220;

  const shell = { minHeight: '100vh', background: '#f7f9ff' };

  // left: fixed
  const left = {
    position: 'fixed', left: 0, top: 0, bottom: 0, width: LEFT_W,
    background: '#4A7CFF', color: '#fff', padding: '28px 20px',
    display: 'flex', flexDirection: 'column'
  };

  const brand = { fontWeight: 700, fontSize: 22, marginBottom: 6 };
  const tag = { opacity: 0.92, fontSize: 14, marginBottom: 18 };

  const navItem = (active) => ({
    padding: '10px 12px',
    borderRadius: 8,
    marginBottom: 6,
    color: '#fff',
    textDecoration: 'none',
    display: 'block',
    background: active ? 'rgba(255,255,255,0.16)' : 'transparent',
  });

  const leftFooter = {
    marginTop: 'auto',
    paddingTop: 12,
    borderTop: '1px solid rgba(255,255,255,0.22)',
  };
  const logoutBtn = {
    width: '100%',
    textAlign: 'left',
    padding: '10px 12px',
    borderRadius: 8,
    background: 'rgba(255,255,255,0.10)',
    color: '#fff',
    border: 'none',
    fontWeight: 600,
    cursor: 'pointer',
  };

  // RIGHT: the ONLY scrolling area, offset by the sidebar width
  const right = { marginLeft: LEFT_W, height: '100vh', overflowY: 'auto' };
  const inner = { maxWidth: 1000, margin: '0 auto', padding: '24px 28px 32px' };

  const header = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 12,
  };
  const pill = {
    height: 36,
    borderRadius: 10,
    background: '#f6f8ff',
    color: '#334155',
    border: '1px solid #e6eaf9',
    fontWeight: 600,
    padding: '0 12px',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    marginRight: 12,
  };
  const avatar = {
    width: 36,
    height: 36,
    borderRadius: '50%',
    background: '#eef2ff',
    color: '#3b5bff',
    display: 'grid',
    placeItems: 'center',
    fontWeight: 700,
  };
  const initials = (email) => {
    const base = (email || '').split('@')[0].trim();
    if (!base) return 'U';
    const parts = base.split(/[._-]+/).filter(Boolean);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return base.slice(0, 2).toUpperCase();
  };

  const items = useMemo(
    () => [
      { to: '/dashboard', label: 'Overview' },
      { to: '/loans', label: 'Loans' },
      { to: '/investments', label: 'Investments' },
      { to: '/wallet', label: 'Wallet' },
      { to: '/profile', label: 'Profile' },
      { to: '/referrals', label: 'Referrals' },
    ],
    []
  );

  return (
    <div style={shell}>
      {/* LEFT rail */}
      <aside style={left}>
        <div style={brand}>5Klippa</div>
        <div style={tag}>One profile. Borrow & lend.</div>

        {items.map((it) => (
          <Link key={it.to} to={it.to} style={navItem(pathname === it.to)}>
            {it.label}
          </Link>
        ))}

        <div style={leftFooter}>
          <button
            type="button"
            style={logoutBtn}
            onClick={async () => { await signOut(auth); nav('/login', { replace: true }); }}
          >
            Logout
          </button>
        </div>
      </aside>

      {/* RIGHT content */}
      <main style={right}>
        <div style={inner}>
          <div style={header}>
            <button type="button" style={pill} onClick={() => nav('/dashboard')}>Dashboard</button>
            {user && <div style={avatar} title={user.email || ''}>{initials(user.email)}</div>}
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}
