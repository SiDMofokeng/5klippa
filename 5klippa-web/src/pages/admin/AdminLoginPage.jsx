import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function AdminLoginPage() {
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [working, setWorking] = useState(false);
  const [err, setErr] = useState('');

  async function handleLogin(e) {
    e.preventDefault();
    setErr('');
    setWorking(true);
    try {
      const cred = await signInWithEmailAndPassword(auth, email.trim(), pw);
      // keep your existing isAdmin check
      const snap = await getDoc(doc(db, 'users', cred.user.uid));
      const isAdmin = snap.exists() && snap.data()?.isAdmin === true;
      if (!isAdmin) {
        setErr('This account is not an admin.');
        setWorking(false);
        return;
      }
      nav('/admin', { replace: true });
    } catch (e2) {
      setErr(e2.message || 'Failed to sign in');
      setWorking(false);
    }
  }

  // --- styles (match user login hero layout) ---
  const shell = { minHeight: '100vh', background: '#f7f9ff' };

  const hero = {
    position: 'fixed', left: 0, top: 0, bottom: 0, width: 520,
    background: 'linear-gradient(180deg, #4A7CFF 0%, #5E8BFF 60%, #6FA1FF 100%)',
    color: '#fff', padding: '36px 28px',
    display: 'flex', flexDirection: 'column'
  };
  const brand = { fontWeight: 800, fontSize: 28, marginBottom: 6 };
  const tag   = { opacity: 0.92, fontSize: 14, marginBottom: 24 };
  const heroPills = {
    display: 'grid', gridTemplateColumns: '1fr', gap: 14, marginTop: 'auto', paddingRight: 20
  };
  const pill = {
    height: 36, borderRadius: 8, background: 'rgba(255,255,255,0.16)',
    color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 600
  };

  const right = { marginLeft: 520, minHeight: '100vh', display: 'grid', placeItems: 'center' };
  const card  = { background:'#fff', borderRadius:16, boxShadow:'0 10px 40px rgba(16,24,40,0.10)', padding:28, width: 420 };
  const h2    = { margin:'0 0 6px', fontSize:22, fontWeight:800 };
  const sub   = { margin:'0 0 16px', color:'#475569' };
  const label = { display:'block', fontSize:13, margin:'12px 0 6px', color:'#444' };
  const input = { width:'100%', height:44, borderRadius:8, border:'1px solid #d9dbe3', padding:'0 12px', outline:'none', boxSizing:'border-box' };
  const primary = { width:'100%', height:46, borderRadius:10, background:'#4A7CFF', color:'#fff', border:'none', fontWeight:700, cursor:'pointer', marginTop:16 };
  const error = { marginTop:10, color:'#b00020', fontSize:13, minHeight:18 };

  return (
    <div style={shell}>
      {/* left hero */}
      <aside style={hero}>
        <div style={brand}>5Klippa</div>
        <div style={tag}>Admin Control Panel</div>
        <div style={heroPills}>
          <div style={pill}>Review applications</div>
          <div style={pill}>Manage referrals</div>
          <div style={pill}>Wallet oversight</div>
        </div>
      </aside>

      {/* login card */}
      <main style={right}>
        <div style={card}>
          <h2 style={h2}>Admin login</h2>
          <p style={sub}>Sign in with your admin credentials.</p>

          <form onSubmit={handleLogin}>
            <label style={label}>Email</label>
            <input
              style={input}
              type="email"
              value={email}
              onChange={e=>setEmail(e.target.value)}
              required
            />

            <label style={label}>Password</label>
            <input
              style={input}
              type="password"
              value={pw}
              onChange={e=>setPw(e.target.value)}
              required
            />

            <div style={error}>{err}</div>
            <button type="submit" disabled={working} style={primary}>
              {working ? 'Signing in…' : 'Sign in'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}
