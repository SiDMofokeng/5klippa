// 5klippa-web/src/pages/BorrowerDashboardPage.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout      from '../components/AuthLayout';
import theme           from '../theme';

export default function BorrowerDashboardPage() {
  const navigate = useNavigate();

  const styles = {
    container: {
      maxWidth: '400px',
      margin: 'auto',
      padding: `${theme.spacing.large}px`,
    },
    backButton: {
      marginBottom: `${theme.spacing.medium}px`,
      background: 'transparent',
      color: theme.colors.textMuted,
      border: 'none',
      cursor: 'pointer',
      fontSize: theme.fontSizes.body,
    },
    heading: {
      color: theme.colors.text,
      fontSize: theme.fontSizes.h2,
      fontWeight: 'bold',
      marginBottom: `${theme.spacing.medium}px`,
    },
    subtitle: {
      color: theme.colors.textMuted,
      marginBottom: `${theme.spacing.large}px`,
    },
    primaryButton: {
      width: '100%',
      padding: `${theme.spacing.medium}px`,
      background: theme.colors.primary,
      color: theme.colors.cardBackground,
      border: 'none',
      borderRadius: `${theme.radii.small}px`,
      fontSize: theme.fontSizes.body,
      cursor: 'pointer',
    },
  };

  return (
    <AuthLayout>
      <div style={styles.container}>
        <button
          style={styles.backButton}
          onClick={() => navigate('/dashboard')}
        >
          ← Back
        </button>
        <h1 style={styles.heading}>Borrower Dashboard</h1>
        <p style={styles.subtitle}>
          Your loan applications and status will appear here.
        </p>
        <button
          style={styles.primaryButton}
          onClick={() => navigate('/new-loan')}
        >
          New Loan
        </button>
      </div>
    </AuthLayout>
  );
}
