// src/layouts/DashboardLayout.jsx
import React from 'react';

export default function DashboardLayout({ children }) {
  return (
    <div style={styles.shell}>
      <aside style={styles.left}>
        <div style={styles.brand}>
          <div style={styles.logo}>5Klippa</div>
          <div style={styles.tagline}>One profile. Borrow & lend.</div>
        </div>
      </aside>

      <main style={styles.right}>
        <div style={styles.contentWrap}>
          {children}
        </div>
      </main>
    </div>
  );
}

const styles = {
  shell: {
    display: 'flex',
    minHeight: '100vh',
    background: '#f6f8fc',
  },
  left: {
    width: 320,
    background: '#4A7CFF',
    color: '#fff',
    padding: '28px 24px',
    position: 'sticky',
    top: 0,
    alignSelf: 'flex-start',
    height: '100vh',
  },
  brand: {
    fontFamily: 'system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif',
  },
  logo: {
    fontSize: 24,
    fontWeight: 700,
    letterSpacing: 0.2,
  },
  tagline: {
    marginTop: 8,
    opacity: 0.9,
  },
  right: {
    flex: 1,
    padding: '40px 48px',
  },
  contentWrap: {
    maxWidth: 760,           // prevents “edge stretch”
    margin: '0 auto',
  },
};
