// 5klippa-web/src/onboarding/steps/ContactStep.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc, setDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';
import { markStepComplete } from '../../utils/onboarding';

export default function ContactStep() {
  const nav = useNavigate();
  const [uid, setUid] = useState('');

  const [phone, setPhone] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

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
        setPhone(d.phone || '');
        setAddress1(d.addressLine1 || '');
        setAddress2(d.addressLine2 || '');
        setCity(d.city || '');
        setPostalCode(d.postalCode || '');
      }
      setLoading(false);
    });
    return () => unsub();
  }, [nav]);

  async function submit(e) {
    e.preventDefault();
    setErr('');
    if (!phone.trim() || !address1.trim() || !city.trim() || !postalCode.trim()) { setErr('Please fill required fields.'); return; }
    setSaving(true);
    try {
      const ref = doc(db, 'users', uid);
      await setDoc(ref, {
        phone: phone.trim(),
        addressLine1: address1.trim(),
        addressLine2: address2.trim(),
        city: city.trim(),
        postalCode: postalCode.trim(),
        updatedAt: serverTimestamp(),
        onboarding: {
          currentStep: 'financial',
          completed: arrayUnion('contact'),
        }
      }, { merge: true });
      await markStepComplete(db, uid, 'contact', 'financial');
      nav('/onboarding/financial', { replace: true });
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
      <h2 style={{ margin: 0 }}>Contact</h2>
      <p style={{ color: '#666', marginTop: 8 }}>How can we reach you?</p>

      <form onSubmit={submit} style={{ marginTop: 16 }}>
        <label style={label}>Phone</label>
        <input value={phone} onChange={(e) => setPhone(e.target.value)} style={input} placeholder="e.g. 082 123 4567" />

        <label style={label}>Address line 1</label>
        <input value={address1} onChange={(e) => setAddress1(e.target.value)} style={input} placeholder="Street and number" />

        <label style={label}>Address line 2 (optional)</label>
        <input value={address2} onChange={(e) => setAddress2(e.target.value)} style={input} placeholder="Apartment, suite, etc." />

        <label style={label}>City</label>
        <input value={city} onChange={(e) => setCity(e.target.value)} style={input} placeholder="City" />

        <label style={label}>Postal code</label>
        <input value={postalCode} onChange={(e) => setPostalCode(e.target.value)} style={input} placeholder="e.g. 8000" />

        {err && <div style={error}>{err}</div>}

        <button type="submit" disabled={saving} style={primary}>
          {saving ? 'Saving…' : 'Continue'}
        </button>
      </form>
    </div>
  );
}
