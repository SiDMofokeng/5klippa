// 5klippa-web/src/pages/LoginPage.js

import React, { useState }                 from 'react';
import { useNavigate, Link }               from 'react-router-dom';
import { signInWithEmailAndPassword }       from 'firebase/auth';
import { auth }                            from '../firebaseConfig';
import AuthLayout                          from '../components/AuthLayout';
import theme                               from '../theme';

export default function LoginPage() {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
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
      <form onSubmit={handleLogin} style={styles.form}>
        <h2 style={{ marginBottom: `${theme.spacing.medium}px` }}>Login</h2>
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
        {error && <p style={styles.error}>{error}</p>}
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Logging in…' : 'Login'}
        </button>
        <p style={styles.footer}>
          New user? <Link to="/register">Register here</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
