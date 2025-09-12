// 5klippa-web/src/pages/RegisterPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  deleteUser,
} from 'firebase/auth';
import {
  doc,
  runTransaction,
  setDoc,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import AuthLayout from '../components/AuthLayout';
import theme from '../theme';

export default function RegisterPage() {
  const nav = useNavigate();

  const [email, setEmail]         = useState('');
  const [password, setPassword]   = useState('');
  const [referral, setReferral]   = useState('');
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState('');

  const styles = {
    form: {
      maxWidth: '400px',
      margin: 'auto',
      padding: `${theme.spacing.large}px`,
    },
    input: {
      width: '100%',
      padding: `${theme.spacing.small}px`,
      marginBottom: `${theme.spacing.medium}px`,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: `${theme.radii.small}px`,
      boxSizing: 'border-box',
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
    error: {
      color: theme.colors.error,
      marginBottom: `${theme.spacing.small}px`,
    },
    footer: {
      marginTop: `${theme.spacing.medium}px`,
      textAlign: 'center',
    },
    label: {
      display: 'block',
      fontSize: 13,
      marginBottom: 6,
      color: '#444',
    },
  };

  async function handleRegister(e) {
    e.preventDefault();
    setError('');

    const code = referral.trim().toUpperCase();
    if (!code) {
      setError('Referral code is required.');
      return;
    }

    setLoading(true);
    let cred = null;
    let ownerUid = null;

    try {
      // 1) Create Auth user
      cred = await createUserWithEmailAndPassword(auth, email.trim(), password);

      // 2) Consume referral in a transaction (increment usedCount by 1)
      const refRef = doc(db, 'referrals', code);
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(refRef);
        if (!snap.exists()) throw new Error('Invalid referral code.');
        const data = snap.data();

        if (data.active === false) {
          throw new Error('This referral code is inactive.');
        }

        const used  = Number(data.usedCount || 0);
        const limit = Number(data.usageLimit || 0);
        if (!Number.isFinite(limit) || limit < 1) {
          throw new Error('Referral code misconfigured.');
        }
        if (used + 1 > limit) {
          throw new Error('This referral code has no remaining uses.');
        }

        // Record for later write to user doc
        ownerUid = data.ownerUid || null;

        // Only increment usedCount (rules allow this exact +1 update)
        tx.update(refRef, { usedCount: used + 1 });
        // NOTE: We do NOT toggle `active` here to satisfy your rules.
      });

      // 3) Write user profile + onboarding kickoff
      await setDoc(
        doc(db, 'users', cred.user.uid),
        {
          email: cred.user.email,
          referredByCode: code,
          referredByUid: ownerUid || null,
          referredAt: serverTimestamp(),
          onboarding: {
            currentStep: 'identity',
            completed: arrayUnion('account'),
          },
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      // 4) Go to first onboarding step
      nav('/onboarding/identity', { replace: true });
    } catch (err) {
      // Roll back the newly created user if something failed after creation
      if (cred?.user) {
        try { await deleteUser(cred.user); } catch { /* ignore */ }
      }
      setError(err.message || 'Failed to register.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={handleRegister} style={styles.form}>
        <h2 style={{ marginBottom: `${theme.spacing.medium}px` }}>Create your account</h2>

        <label style={styles.label}>Email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
          placeholder="you@example.com"
        />

        <label style={styles.label}>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          style={styles.input}
          placeholder="••••••••"
        />

        <label style={styles.label}>Referral Code</label>
        <input
          value={referral}
          onChange={(e) => setReferral(e.target.value)}
          required
          style={styles.input}
          placeholder="e.g. TEAM123"
        />

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Creating…' : 'Register'}
        </button>

        <p style={styles.footer}>
          Already have an account? <Link to="/login">Login</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
