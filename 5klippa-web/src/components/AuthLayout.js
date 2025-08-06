// 5klippa-web/src/components/AuthLayout.js

import React from 'react';

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'sans-serif',
  },
  hero: {
    flex: 1,
    background: '#4A7CFF',
    color: '#fff',
    padding: '2rem',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: '2.5rem',
    fontWeight: 'bold',
    marginBottom: '1rem',
  },
  heroSubtitle: {
    fontSize: '1.1rem',
    marginBottom: '2rem',
  },
  // Simple feature grid placeholder
  features: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '1rem',
  },
  featureItem: {
    background: '#fff2',
    padding: '0.75rem',
    borderRadius: '8px',
    fontSize: '0.9rem',
  },
  cardContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    background: '#fff',
    borderRadius: '20px',
    padding: '2rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  // Responsive: stack on small screens
  '@media(max-width:600px)': {
    container: { flexDirection: 'column' },
    hero: { padding: '1.5rem' },
    cardContainer: { padding: '1.5rem' },
  },
};

export default function AuthLayout({ children }) {
  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <div>
          <h1 style={styles.heroTitle}>5Klippa</h1>
          <p style={styles.heroSubtitle}>Financial Freedom Starts Here</p>
        </div>
        <div style={styles.features}>
          <div style={styles.featureItem}>P2P Lending</div>
          <div style={styles.featureItem}>Instant Wallet</div>
          <div style={styles.featureItem}>Secure</div>
          <div style={styles.featureItem}>Low Fees</div>
        </div>
      </div>
      <div style={styles.cardContainer}>
        <div style={styles.card}>{children}</div>
      </div>
    </div>
  );
}
