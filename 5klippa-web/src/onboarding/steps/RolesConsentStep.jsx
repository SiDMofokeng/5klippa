// 5klippa-web/src/onboarding/steps/RolesConsentStep.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc, setDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { markStepComplete } from '../../utils/onboarding';

export default function RolesConsentStep() {
  const nav = useNavigate();
  const [uid, setUid] = useState('');

  const [borrowerEnabled, setBorrowerEnabled] = useState(true);
  const [lenderEnabled, setLenderEnabled] = useState(true);
  const [creditConsent, setCreditConsent] = useState(false);

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
        setBorrowerEnabled(d.borrowerEnabled !== false);
        setLenderEnabled(d.lenderEnabled !== false);
        setCreditConsent(Boolean(d.creditConsent));
      }
      setLoading(false);
    });
    return () => unsub();
  }, [nav]);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    if (!creditConsent) { setErr('You must consent to continue.'); return; }
    setSaving(true);
    try {
      const ref = doc(db, 'users', uid);
      await setDoc(ref, {
        borrowerEnabled,
        lenderEnabled,
        creditConsent: true,
        updatedAt: serverTimestamp(),
        onboarding: {
          currentStep: 'done',
          completed: arrayUnion('roles'),
        }
      }, { merge: true });
      await markStepComplete(db, uid, 'roles'); // no next step
      nav('/onboarding/done', { replace: true });
    } catch (e2) {
      setErr(e2.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  const wrap = { maxWidth: 520, margin: '0 auto' };
  const row = { display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 };
  const primary = { marginTop: 20, width: '100%', height: 46, borderRadius: 10, background: '#4A7CFF', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' };
  const error = { marginTop: 10, color: '#b00020', fontSize: 13 };

  if (loading) return <div>Loading…</div>;

  return (
    <div style={wrap}>
      <h2 style={{ margin: 0 }}>Consent & Roles</h2>
      <p style={{ color: '#666', marginTop: 8 }}>Choose roles and give consent.</p>

      <form onSubmit={submit} style={{ marginTop: 16 }}>
        <label style={row}>
          <input type="checkbox" checked={borrowerEnabled} onChange={(e) => setBorrowerEnabled(e.target.checked)} />
          <span>Enable Borrower</span>
        </label>

        <label style={row}>
          <input type="checkbox" checked={lenderEnabled} onChange={(e) => setLenderEnabled(e.target.checked)} />
          <span>Enable Lender</span>
        </label>

        <label style={row}>
          <input type="checkbox" checked={creditConsent} onChange={(e) => setCreditConsent(e.target.checked)} />
          <span>I consent to credit checks</span>
        </label>

        {err && <div style={error}>{err}</div>}

        <button type="submit" disabled={saving} style={primary}>
          {saving ? 'Saving…' : 'Finish'}
        </button>
      </form>
    </div>
  );
}
