// 5klippa-web/src/pages/RegisterPage.js

import React, { useState }                   from 'react';
import { useNavigate, Link }                 from 'react-router-dom';
import { createUserWithEmailAndPassword }     from 'firebase/auth';
import { auth, db }                          from '../firebaseConfig';
import { doc, setDoc }                       from 'firebase/firestore';
import AuthLayout                            from '../components/AuthLayout';
import theme                                 from '../theme';

export default function RegisterPage() {
  const [email, setEmail]           = useState('');
  const [password, setPassword]     = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole]             = useState('borrower');
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      await setDoc(doc(db, 'users', user.uid), {
        email: user.email,
        role,
      });
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message);
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
    radioGroup: {
      marginBottom: `${theme.spacing.medium}px`,
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
  };

  return (
    <AuthLayout>
      <form onSubmit={handleRegister} style={styles.form}>
        <h2 style={{ marginBottom: `${theme.spacing.medium}px` }}>Register</h2>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={e => setConfirmPassword(e.target.value)}
          required
          style={styles.input}
        />
        <div style={styles.radioGroup}>
          <label>
            <input
              type="radio"
              value="borrower"
              checked={role === 'borrower'}
              onChange={() => setRole('borrower')}
            /> Borrower
          </label>
          <label style={{ marginLeft: `${theme.spacing.medium}px` }}>
            <input
              type="radio"
              value="lender"
              checked={role === 'lender'}
              onChange={() => setRole('lender')}
            /> Lender
          </label>
        </div>
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
