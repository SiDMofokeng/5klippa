// 5klippa-web/src/onboarding/steps/FinancialStep.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc, setDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { markStepComplete } from '../../utils/onboarding';

export default function FinancialStep() {
  const nav = useNavigate();
  const [uid, setUid] = useState('');

  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [income, setIncome] = useState('');
  const [expenses, setExpenses] = useState('');

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) { nav('/login', { replace: true }); return; }
      setUid(u.uid);
      const snap = await getDoc(doc(db, 'users', u.uid));
      if (snap.exists()) {
        const d = snap.data();
        setAccountNumber(d?.bank?.accountNumber || '');
        setBankName(d?.bank?.name || '');
        setIncome(d?.income ? String(d.income) : '');
        setExpenses(d?.expenses ? String(d.expenses) : '');
      }
      setLoading(false);
    });
    return () => unsub();
  }, [nav]);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    if (!accountNumber.trim() || !bankName.trim()) { setErr('Please fill bank details.'); return; }
    setSaving(true);
    try {
      const ref = doc(db, 'users', uid);
      await setDoc(ref, {
        bank: { accountNumber: accountNumber.trim(), name: bankName.trim() },
        income: income ? Number(income) : null,
        expenses: expenses ? Number(expenses) : null,
        updatedAt: serverTimestamp(),
        onboarding: {
          currentStep: 'roles',
          completed: arrayUnion('financial'),
        }
      }, { merge: true });
      await markStepComplete(db, uid, 'financial', 'roles');
      nav('/onboarding/roles', { replace: true });
    } catch (e2) {
      setErr(e2.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  const wrap = { maxWidth: 520, margin: '0 auto' };
  const label = { display: 'block', fontSize: 13, marginTop: 14, marginBottom: 6, color: '#444' };
  const input = { width: '100%', height: 44, borderRadius: 8, border: '1px solid #d9dbe3', padding: '0 12px', outline: 'none' };
  const primary = { marginTop: 20, width: '100%', height: 46, borderRadius: 10, background: '#4A7CFF', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' };
  const error = { marginTop: 10, color: '#b00020', fontSize: 13 };

  if (loading) return <div>Loading…</div>;

  return (
    <div style={wrap}>
      <h2 style={{ margin: 0 }}>Financial</h2>
      <p style={{ color: '#666', marginTop: 8 }}>Bank account and basics.</p>

      <form onSubmit={submit} style={{ marginTop: 16 }}>
        <label style={label}>Account number</label>
        <input value={accountNumber} onChange={(e) => setAccountNumber(e.target.value)} style={input} placeholder="e.g. 1234567890" />

        <label style={label}>Bank name</label>
        <input value={bankName} onChange={(e) => setBankName(e.target.value)} style={input} placeholder="e.g. FNB, Standard Bank" />

        <label style={label}>Monthly income (optional)</label>
        <input value={income} onChange={(e) => setIncome(e.target.value)} style={input} placeholder="e.g. 20000" />

        <label style={label}>Monthly expenses (optional)</label>
        <input value={expenses} onChange={(e) => setExpenses(e.target.value)} style={input} placeholder="e.g. 12000" />

        {err && <div style={error}>{err}</div>}

        <button type="submit" disabled={saving} style={primary}>
          {saving ? 'Saving…' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
