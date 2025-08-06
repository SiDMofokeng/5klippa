// 5klippa-web/src/pages/DashboardPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate }                 from 'react-router-dom';
import { auth, db }                    from '../firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc }                 from 'firebase/firestore';
import AuthLayout                      from '../components/AuthLayout';
import theme                           from '../theme';

export default function DashboardPage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading]   = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) setUserData(snap.data());
      } else {
        navigate('/login', { replace: true });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login', { replace: true });
  };

  if (loading) {
    return (
      <AuthLayout>
        <p>Loading…</p>
      </AuthLayout>
    );
  }

  const styles = {
    container: {
      maxWidth: '400px',
      margin: 'auto',
      padding: `${theme.spacing.large}px`,
    },
    heading: {
      color: theme.colors.text,
      fontSize: theme.fontSizes.h2,
      fontWeight: 'bold',
      marginBottom: `${theme.spacing.medium}px`,
    },
    text: {
      color: theme.colors.textMuted,
      marginBottom: `${theme.spacing.large}px`,
    },
    btnPrimary: {
      width: '100%',
      padding: `${theme.spacing.medium}px`,
      background: theme.colors.primary,
      color: theme.colors.cardBackground,
      border: 'none',
      borderRadius: `${theme.radii.small}px`,
      fontSize: theme.fontSizes.body,
      cursor: 'pointer',
      marginBottom: `${theme.spacing.small}px`,
    },
    // secondary: light background, primary text + border
    btnSecondary: {
      width: '100%',
      padding: `${theme.spacing.medium}px`,
      background: theme.colors.cardBackground,
      color: theme.colors.primary,
      border: `1px solid ${theme.colors.primary}`,
      borderRadius: `${theme.radii.small}px`,
      fontSize: theme.fontSizes.body,
      cursor: 'pointer',
    },
  };

  return (
    <AuthLayout>
      <div style={styles.container}>
        <h1 style={styles.heading}>
          Welcome, {userData.email}!
        </h1>
        <p style={styles.text}>Role: {userData.role}</p>

        {userData.role === 'borrower' && (
          <button
            style={styles.btnPrimary}
            onClick={() => navigate('/borrower-dashboard')}
          >
            Borrower Dashboard
          </button>
        )}

        <button
          style={styles.btnSecondary}
          onClick={handleLogout}
        >
          Log Out
        </button>
      </div>
    </AuthLayout>
  );
}
