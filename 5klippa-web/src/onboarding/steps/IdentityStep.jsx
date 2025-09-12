// 5klippa-web/src/onboarding/steps/IdentityStep.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc, setDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { markStepComplete } from '../../utils/onboarding';

export default function IdentityStep() {
  const nav = useNavigate();
  const [uid, setUid] = useState('');
  const [fullName, setFullName] = useState('');
  const [idNumber, setIdNumber] = useState('');
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
        setFullName(d.fullName || '');
        setIdNumber(d.idNumber || '');
      }
      setLoading(false);
    });
    return () => unsub();
  }, [nav]);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    if (!fullName.trim() || !idNumber.trim()) { setErr('Please fill all fields.'); return; }
    setSaving(true);
    try {
      const ref = doc(db, 'users', uid);
      await setDoc(ref, {
        fullName: fullName.trim(),
        idNumber: idNumber.trim(),
        updatedAt: serverTimestamp(),
        onboarding: {
          currentStep: 'contact',
          completed: arrayUnion('identity'),
        }
      }, { merge: true });
      await markStepComplete(db, uid, 'identity', 'contact');
      nav('/onboarding/contact', { replace: true });
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
      <h2 style={{ margin: 0 }}>Identity</h2>
      <p style={{ color: '#666', marginTop: 8 }}>Tell us who you are.</p>

      <form onSubmit={submit} style={{ marginTop: 16 }}>
        <label style={label}>Full name</label>
        <input value={fullName} onChange={(e) => setFullName(e.target.value)} style={input} placeholder="e.g. Thandiwe Nkosi" />

        <label style={label}>ID number</label>
        <input value={idNumber} onChange={(e) => setIdNumber(e.target.value)} style={input} placeholder="e.g. 9001015800087" />

        {err && <div style={error}>{err}</div>}

        <button type="submit" disabled={saving} style={primary}>
          {saving ? 'Saving…' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
