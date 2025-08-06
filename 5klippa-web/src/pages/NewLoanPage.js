// 5klippa-web/src/pages/NewLoanPage.js

import React, { useState }                    from 'react';
import { useNavigate }                        from 'react-router-dom';
import { auth, db }                           from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import AuthLayout                             from '../components/AuthLayout';
import theme                                  from '../theme';

// Icon imports
import { FaDollarSign, FaCalendarAlt, FaAlignLeft } from 'react-icons/fa';

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
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
      marginBottom: `${theme.spacing.large}px`,
    },
    fieldWrapper: {
      position: 'relative',
      marginBottom: `${theme.spacing.medium}px`,
    },
    icon: {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      left: `${theme.spacing.small}px`,
      color: theme.colors.textMuted,
    },
    input: {
      width: '100%',
      padding: `${theme.spacing.small}px ${theme.spacing.small}px ${theme.spacing.small}px ${theme.spacing.large * 2}px`,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: `${theme.radii.small}px`,
      boxSizing: 'border-box',
    },
    textarea: {
      width: '100%',
      padding: `${theme.spacing.small}px ${theme.spacing.small}px ${theme.spacing.small}px ${theme.spacing.large * 2}px`,
      border: `1px solid ${theme.colors.border}`,
      borderRadius: `${theme.radii.small}px`,
      boxSizing: 'border-box',
      resize: 'vertical',
    },
    error: {
      color: theme.colors.error,
      marginBottom: `${theme.spacing.small}px`,
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
      <form onSubmit={handleSubmit} style={styles.container}>
        <button
          style={styles.backButton}
          onClick={() => navigate('/borrower-dashboard')}
          type="button"
        >
          ← Back
        </button>

        <h1 style={styles.heading}>New Loan Application</h1>

        <div style={styles.fieldWrapper}>
          <FaDollarSign style={styles.icon} />
          <input
            type="number"
            placeholder="Amount (e.g. 5000)"
            value={amount}
            onChange={e => setAmount(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.fieldWrapper}>
          <FaCalendarAlt style={styles.icon} />
          <input
            type="number"
            placeholder="Term (months)"
            value={term}
            onChange={e => setTerm(e.target.value)}
            style={styles.input}
          />
        </div>

        <div style={styles.fieldWrapper}>
          <FaAlignLeft style={styles.icon} />
          <textarea
            placeholder="Purpose"
            value={purpose}
            onChange={e => setPurpose(e.target.value)}
            rows="3"
            style={styles.textarea}
          />
        </div>

        {error && <p style={styles.error}>{error}</p>}

        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Submitting…' : 'Submit Application'}
        </button>
      </form>
    </AuthLayout>
  );
}
