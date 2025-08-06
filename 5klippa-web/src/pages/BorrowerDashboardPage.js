// 5klippa-web/src/pages/BorrowerDashboardPage.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import AuthLayout from '../components/AuthLayout';
import theme from '../theme';

export default function BorrowerDashboardPage() {
  const navigate = useNavigate();
  const styles = {
    title: {
      color: theme.colors.text,
      fontSize: theme.fontSizes.h2,
      fontWeight: 'bold',
      marginBottom: `${theme.spacing.medium}px`,
    },
    subtitle: {
      color: theme.colors.textMuted,
      marginBottom: `${theme.spacing.large}px`,
    },
    button: {
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
      <div style={{ maxWidth: '400px', margin: 'auto', padding: `${theme.spacing.large}px` }}>
        <h2 style={styles.title}>Borrower Dashboard</h2>
        <p style={styles.subtitle}>
          Your loan applications and status will appear here.
        </p>
        <button
          style={styles.button}
          onClick={() => navigate('/new-loan')}
        >
          New Loan
        </button>
      </div>
    </AuthLayout>
  );
}
