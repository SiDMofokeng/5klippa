// 5klippa-web/src/components/DashboardShell.jsx
import React from 'react';
import theme from '../theme';
import SidebarNav from './SidebarNav';

export default function DashboardShell({ title = 'Overview', children }) {
  return (
    <div style={wrapper}>
      {/* LEFT RAIL */}
      <aside style={rail}>
        <div style={brandWrap}>
          <div style={brand}>5Klippa</div>
          <div style={tagline}>One profile. Borrow & lend.</div>
        </div>
        <SidebarNav />
      </aside>

      {/* RIGHT CONTENT */}
      <main style={content}>
        <h1 style={pageTitle}>{title}</h1>
        {children}
      </main>
    </div>
  );
}

const wrapper = {
  display: 'grid',
  gridTemplateColumns: '320px minmax(0, 1fr)',
  height: '100vh',
  background: '#f6f7fb',
};

const rail = {
  background: theme.colors.primary,
  color: '#fff',
  padding: '28px 20px',
  display: 'flex',
  flexDirection: 'column',
};

const brandWrap = { marginBottom: 24, padding: '0 6px' };
const brand = { fontWeight: 700, fontSize: 22, letterSpacing: 0.2 };
const tagline = { marginTop: 6, opacity: 0.9, fontSize: 14 };

const content = {
  height: '100%',
  overflow: 'auto',
  padding: '32px 40px',
  display: 'flex',
  flexDirection: 'column',
};

const pageTitle = {
  margin: 0,
  marginBottom: 16,
  fontSize: 22,
  fontWeight: 700,
  color: '#1b1e28',
};
