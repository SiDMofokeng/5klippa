// 5klippa-web/src/components/AuthLayout.js

import React from 'react';
import theme from '../theme';

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
  },
  hero: {
    flex: 1,
    background: theme.colors.primary,
    color: '#fff',
    padding: theme.spacing.large + 'px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: theme.fontSizes.h1,
    fontWeight: 'bold',
    marginBottom: theme.spacing.medium + 'px',
  },
  heroSubtitle: {
    fontSize: theme.fontSizes.body,
    marginBottom: theme.spacing.large + 'px',
  },
  features: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: theme.spacing.medium + 'px',
  },
  featureItem: {
    background: theme.colors.cardBackground + '20',
    padding: theme.spacing.small + 'px',
    borderRadius: theme.radii.small + 'px',
    fontSize: theme.fontSizes.small,
  },
  cardContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.large + 'px',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    background: theme.colors.cardBackground,
    borderRadius: theme.radii.large + 'px',
    padding: theme.spacing.large + 'px',
    boxShadow: theme.shadows.default,
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
