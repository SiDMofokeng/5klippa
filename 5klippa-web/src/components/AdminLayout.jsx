// src/components/admin/AdminLayout.jsx
import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

// Tweak these two only if you want micro-adjustments later
const SIDEBAR_WIDTH = 240;  // px
const CONTENT_MAX   = 1100; // px

export default function AdminLayout() {
  const nav = useNavigate();

  const styles = {
    app: {
      background: '#f6f7fb',
      minHeight: '100vh',
      overflowX: 'hidden',
      boxSizing: 'border-box',
    },

    /* -------- FIXED SIDEBAR -------- */
    sidebar: {
      position: 'fixed',
      left: 0,
      top: 0,
      bottom: 0,
      width: SIDEBAR_WIDTH,
      background: 'linear-gradient(180deg, #4A7CFF 0%, #4A7CFF 100%)',
      color: '#e6eefb',
      display: 'flex',
      flexDirection: 'column',
      padding: '20px 16px',
      boxShadow: '2px 0 18px rgba(0,0,0,0.08)',
      overflowY: 'auto',   // only the whole sidebar scrolls if content is long
      overflowX: 'hidden', // no horizontal scrollbar
      zIndex: 100,
    },
    brandWrap: {
      padding: '6px 10px 16px',
      borderBottom: '1px solid rgba(255,255,255,0.08)',
      marginBottom: 14,
    },
    brandTitle: { margin: 0, fontSize: 18, fontWeight: 700, color: '#fff' },
    brandSub:   { marginTop: 6, fontSize: 12, opacity: 0.85 },

    nav: { display: 'flex', flexDirection: 'column', gap: 6, paddingRight: 2 },

    linkBase: {
      display: 'block',
      padding: '10px 12px',
      borderRadius: 10,
      color: '#d5def0',
      textDecoration: 'none',
      fontSize: 14,
      fontWeight: 600,
      transition: 'background 120ms ease, color 120ms ease',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
    linkActive: { background: 'rgba(255,255,255,0.12)', color: '#fff' },

    spacer: { flex: 1 },

    logoutBtn: {
      width: '100%',
      padding: '12px',
      borderRadius: 10,
      border: '1px solid rgba(255,255,255,0.18)',
      background: 'transparent',
      color: '#e6eefb',
      fontWeight: 600,
      cursor: 'pointer',
    },

    /* -------- MAIN CONTENT -------- */
    main: {
      marginLeft: SIDEBAR_WIDTH, // makes room for the fixed sidebar
      padding: '24px 28px',
      boxSizing: 'border-box',
      minHeight: '100vh',
    },
    container: {
      maxWidth: CONTENT_MAX,
      margin: '0 auto',
      width: '100%',
      boxSizing: 'border-box',
    },
  };

  const linkStyle = ({ isActive }) =>
    isActive ? { ...styles.linkBase, ...styles.linkActive } : styles.linkBase;

  const handleLogout = async () => {
    try {
      await signOut(auth);
      nav('/admin/login', { replace: true });
    } catch (e) {
      console.error('Logout failed', e);
    }
  };

  return (
    <div style={styles.app}>
      {/* ensures base elements fill the viewport and no default margins create shifts */}
      <style>{`
        html, body, #root { height: 100%; }
        body { margin: 0; }
      `}</style>

      <aside style={styles.sidebar}>
        <div style={styles.brandWrap}>
          <h1 style={styles.brandTitle}>5Klippa Admin</h1>
          <div style={styles.brandSub}>Control panel</div>
        </div>

        <nav style={styles.nav}>
          <NavLink to="/admin" end style={linkStyle}>Overview</NavLink>
          <NavLink to="/admin/users" style={linkStyle}>Users</NavLink>
          <NavLink to="/admin/applications" style={linkStyle}>Applications</NavLink>
          <NavLink to="/admin/referrals" style={linkStyle}>Referrals</NavLink>
          <NavLink to="/admin/wallets" style={linkStyle}>Wallets</NavLink>
          <NavLink to="/admin/settings" style={linkStyle}>Settings</NavLink>
        </nav>

        <div style={styles.spacer} />
        <button type="button" style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
      </aside>

      <main style={styles.main}>
        <div style={styles.container}>
          <Outlet />
        </div>
      </main>
    </div>
  );
}
