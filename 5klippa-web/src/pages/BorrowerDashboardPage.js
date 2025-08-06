// 5klippa-web/src/pages/BorrowerDashboardPage.js

import React, { useState, useEffect }           from 'react';
import { useNavigate }                          from 'react-router-dom';
import { auth, db }                             from '../firebaseConfig';
import { collection, query, where, getDocs }     from 'firebase/firestore';
import AuthLayout                               from '../components/AuthLayout';
import theme                                    from '../theme';

export default function BorrowerDashboardPage() {
  const navigate = useNavigate();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading]           = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const user = auth.currentUser;
        const q = query(
          collection(db, 'applications'),
          where('borrowerId', '==', user.uid)
        );
        const snapshot = await getDocs(q);
        const apps = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setApplications(apps);
      } catch (e) {
        console.error('Error fetching applications:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

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
    card: {
      background: theme.colors.cardBackground,
      borderRadius: `${theme.radii.small}px`,
      padding: `${theme.spacing.medium}px`,
      boxShadow: theme.shadows.default,
      marginBottom: `${theme.spacing.medium}px`,
    },
    cardText: {
      margin: 0,
      color: theme.colors.text,
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
    noData: {
      color: theme.colors.textMuted,
      textAlign: 'center',
      marginBottom: `${theme.spacing.large}px`,
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

        {loading ? (
          <p style={styles.noData}>Loading your applications…</p>
        ) : applications.length === 0 ? (
          <p style={styles.noData}>No loan applications yet.</p>
        ) : (
          applications.map(app => (
            <div key={app.id} style={styles.card}>
              <p style={styles.cardText}>
                <strong>Amount:</strong> {app.amount}
              </p>
              <p style={styles.cardText}>
                <strong>Term:</strong> {app.term} months
              </p>
              <p style={styles.cardText}>
                <strong>Status:</strong> {app.status}
              </p>
            </div>
          ))
        )}

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
