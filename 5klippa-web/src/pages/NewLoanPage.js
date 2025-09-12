import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import DashboardLayout from '../components/DashboardLayout';

export default function NewLoanPage() {
  const [amount, setAmount] = useState('');
  const [term, setTerm] = useState('');
  const [purpose, setPurpose] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const submit = async (e) => {
    e.preventDefault();
    setErr('');
    if (!amount || !term || !purpose) { setErr('All fields are required.'); return; }
    const user = auth.currentUser;
    if (!user) { setErr('You are not signed in.'); return; }

    setLoading(true);
    try {
      await addDoc(collection(db, 'applications'), {
        borrowerId: user.uid,
        amount: Number(amount),
        term: Number(term),
        purpose,
        status: 'pending',
        createdAt: serverTimestamp(),
      });
      nav('/loans', { replace: true });
    } catch (e2) {
      setErr(e2.message || 'Failed to submit application.');
    } finally {
      setLoading(false);
    }
  };

  const wrap = { maxWidth: 760, margin: '0 auto' };
  const back = { display: 'inline-block', marginBottom: 12, color: '#64748b', cursor: 'pointer' };
  const card = { background: '#fff', borderRadius: 16, boxShadow: '0 8px 30px rgba(16,24,40,0.08)', padding: 24 };
  const h1 = { margin: '0 0 10px', fontSize: 22, fontWeight: 700 };
  const sub = { margin: '0 0 18px', color: '#475569' };
  const label = { display: 'block', fontSize: 13, marginTop: 14, marginBottom: 6, color: '#444' };
  const input = { width: '100%', height: 44, borderRadius: 8, border: '1px solid #d9dbe3', padding: '0 12px', outline: 'none', boxSizing: 'border-box' };
  const textarea = { ...input, height: 'auto', paddingTop: 10, paddingBottom: 10 };
  const error = { marginTop: 12, color: '#b00020', fontSize: 13 };
  const primaryBtn = { marginTop: 20, width: '100%', height: 46, borderRadius: 10, background: '#4A7CFF', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' };

  return (
    <DashboardLayout>
      <div style={wrap}>
        <div style={back} onClick={() => nav(-1)}>← Back</div>

        <div style={card}>
          <h2 style={h1}>New loan application</h2>
          <p style={sub}>Provide a few details to submit your request.</p>

          <form onSubmit={submit}>
            <label style={label}>Amount</label>
            <input
              type="number"
              min="0"
              step="0.01"
              placeholder="e.g. 5000"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={input}
              required
            />

            <label style={label}>Term (months)</label>
            <input
              type="number"
              min="1"
              step="1"
              placeholder="e.g. 12"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
              style={input}
              required
            />

            <label style={label}>Purpose</label>
            <textarea
              rows={4}
              placeholder="Briefly explain what the loan is for"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              style={textarea}
              required
            />

            {err && <div style={error}>{err}</div>}

            <button type="submit" disabled={loading} style={primaryBtn}>
              {loading ? 'Submitting…' : 'Submit application'}
            </button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
