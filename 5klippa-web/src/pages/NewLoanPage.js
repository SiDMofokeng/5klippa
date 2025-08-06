// 5klippa-web/src/pages/NewLoanPage.js

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import AuthLayout from '../components/AuthLayout';
import theme from '../theme';

export default function NewLoanPage() {
  const [amount, setAmount]   = useState('');
  const [term, setTerm]       = useState('');
  const [purpose, setPurpose] = useState('');
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!amount || !term || !purpose) {
      setError('All fields are required.');
      return;
    }
    setLoading(true);
    try {
      const user = auth.currentUser;
      await addDoc(collection(db, 'applications'), {
        borrowerId: user.uid,
        amount: parseFloat(amount),
        term: parseInt(term, 10),
        purpose,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      navigate('/borrower-dashboard', { replace: true });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

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
  };

  return (
    <AuthLayout>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={{ marginBottom: `${theme.spacing.medium}px` }}>New Loan Application</h2>
        <input
          type="number"
          placeholder="Amount (e.g. 5000)"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={styles.input}
        />
        <input
          type="number"
          placeholder="Term (months)"
          value={term}
          onChange={e => setTerm(e.target.value)}
          style={styles.input}
        />
        <textarea
          placeholder="Purpose"
          value={purpose}
          onChange={e => setPurpose(e.target.value)}
          rows="3"
          style={styles.input}
        />
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Submitting…' : 'Submit Application'}
        </button>
      </form>
    </AuthLayout>
  );
}
