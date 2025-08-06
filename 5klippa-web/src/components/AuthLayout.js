// 5klippa-web/src/components/AuthLayout.js

import React from 'react';
import theme from '../theme';

const styles = {
  container: {
    display: 'flex',
    minHeight: '100vh',
    fontFamily: 'sans-serif',
  },
  hero: {
    flex: 1,
    background: theme.colors.primary,
    color: '#fff',
    padding: `${theme.spacing.large}px`,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  heroTitle: {
    fontSize: theme.fontSizes.h1,
    fontWeight: 'bold',
    marginBottom: `${theme.spacing.medium}px`,
  },
  heroSubtitle: {
    fontSize: theme.fontSizes.body,
    marginBottom: `${theme.spacing.large}px`,
  },
  features: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: `${theme.spacing.medium}px`,
  },
  featureItem: {
    background: theme.colors.cardBackground + '20',
    padding: `${theme.spacing.small}px`,
    borderRadius: `${theme.radii.small}px`,
    fontSize: theme.fontSizes.small,
  },
  cardContainer: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: `${theme.spacing.large}px`,
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    background: theme.colors.cardBackground,
    borderRadius: `${theme.radii.large}px`,
    padding: `${theme.spacing.large}px`,
    boxShadow: theme.shadows.default,
  },
};

export default function AuthLayout({ children }) {
  return (
    <div style={styles.container}>
      <div style={styles.hero}>
        <h1 style={styles.heroTitle}>5Klippa</h1>
        <p style={styles.heroSubtitle}>Financial Freedom Starts Here</p>
        <div style={styles.features}>
          <div style={styles.featureItem}>Quick Loans</div>
          <div style={styles.featureItem}>Flexible Repayments</div>
          <div style={styles.featureItem}>P2P Marketplace</div>
          <div style={styles.featureItem}>Secure Platform</div>
        </div>
      </div>
      <div style={styles.cardContainer}>
        <div style={styles.card}>{children}</div>
      </div>
    </div>
  );
}
