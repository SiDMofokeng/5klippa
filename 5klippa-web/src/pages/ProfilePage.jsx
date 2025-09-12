// 5klippa-web/src/pages/ProfilePage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { nextOnboardingStep, stepPath } from '../utils/onboarding';

export default function ProfilePage() {
  const nav = useNavigate();

  const [uid, setUid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [err,   setErr] = useState('');

  // NEW: keep the persisted Firestore snapshot here
  const [userDoc, setUserDoc] = useState(null);

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    idNumber: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    postalCode: '',
    bankAccountNumber: '',
  });

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) { nav('/login', { replace: true }); return; }
      setUid(u.uid);

      const snap = await getDoc(doc(db, 'users', u.uid));
      if (snap.exists()) {
        const d = snap.data();
        setUserDoc(d); // <-- IMPORTANT: store the saved doc
        setForm({
          fullName: d.fullName || '',
          phone: d.phone || '',
          idNumber: d.idNumber || '',
          addressLine1: d.addressLine1 || '',
          addressLine2: d.addressLine2 || '',
          city: d.city || '',
          postalCode: d.postalCode || '',
          bankAccountNumber: d.bank?.accountNumber || '',
        });
      }
      setLoading(false);
    });
    return () => unsub();
  }, [nav]);

  const onChange = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const save = async (e) => {
    e.preventDefault();
    if (!uid) return;
    setErr(''); setNotice(''); setSaving(true);
    try {
      const payload = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        idNumber: form.idNumber.trim(),
        addressLine1: form.addressLine1.trim(),
        addressLine2: form.addressLine2.trim(),
        city: form.city.trim(),
        postalCode: form.postalCode.trim(),
        bank: { accountNumber: form.bankAccountNumber.trim() },
        updatedAt: serverTimestamp(),
      };
      await setDoc(doc(db, 'users', uid), payload, { merge: true });

      // reflect saved state locally so "Continue onboarding" uses fresh data
      setUserDoc((d) => ({ ...(d || {}), ...payload }));

      setNotice('Saved');
    } catch (e2) {
      setErr(e2.message || 'Failed to save');
    } finally {
      setSaving(false);
      setTimeout(() => setNotice(''), 2000);
    }
  };

  // --- styles (unchanged) ---
  const wrap = { maxWidth: 760, margin: '0 auto' };
  const card = { background: '#fff', borderRadius: 16, boxShadow: '0 8px 30px rgba(16,24,40,0.08)', padding: 24 };
  const h2 = { margin: '0 0 8px', fontSize: 22, fontWeight: 700 };
  const sub = { margin: '0 0 18px', color: '#475569' };
  const grid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 };
  const full = { gridColumn: '1 / -1' };
  const label = { display: 'block', fontSize: 13, marginTop: 6, marginBottom: 6, color: '#444' };
  const input = { width: '100%', height: 44, borderRadius: 8, border: '1px solid #d9dbe3', padding: '0 12px', outline: 'none', boxSizing: 'border-box' };
  const row = { marginTop: 10, display: 'flex', gap: 12 };
  const primary = { height: 44, borderRadius: 10, background: '#4A7CFF', color: '#fff', border: 'none', fontWeight: 600, padding: '0 16px', cursor: 'pointer' };
  const ghost = { height: 44, borderRadius: 10, background: '#f6f8ff', color: '#334155', border: '1px solid #e6eaf9', fontWeight: 600, padding: '0 16px', cursor: 'pointer' };
  const meta = { minHeight: 20, marginTop: 8, fontSize: 13 };
  const ok = { color: '#177245' };
  const bad = { color: '#b00020' };

  if (loading) {
    return (
      <DashboardLayout>
        <div>Loading…</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={wrap}>
        <div style={card}>
          <h2 style={h2}>Profile</h2>
          <p style={sub}>Update your personal and banking details. These help us verify your account and process loans.</p>

          <form onSubmit={save}>
            <div style={grid}>
              <div className="col" style={full}>
                <label style={label}>Full Name</label>
                <input value={form.fullName} onChange={onChange('fullName')} style={input} required />
              </div>

              <div>
                <label style={label}>Phone</label>
                <input value={form.phone} onChange={onChange('phone')} style={input} />
              </div>

              <div>
                <label style={label}>ID Number</label>
                <input value={form.idNumber} onChange={onChange('idNumber')} style={input} />
              </div>

              <div className="col" style={full}>
                <label style={label}>Address Line 1</label>
                <input value={form.addressLine1} onChange={onChange('addressLine1')} style={input} />
              </div>

              <div className="col" style={full}>
                <label style={label}>Address Line 2</label>
                <input value={form.addressLine2} onChange={onChange('addressLine2')} style={input} />
              </div>

              <div>
                <label style={label}>City</label>
                <input value={form.city} onChange={onChange('city')} style={input} />
              </div>

              <div>
                <label style={label}>Postal Code</label>
                <input value={form.postalCode} onChange={onChange('postalCode')} style={input} />
              </div>

              <div className="col" style={full}>
                <label style={label}>Bank Account Number</label>
                <input value={form.bankAccountNumber} onChange={onChange('bankAccountNumber')} style={input} />
              </div>
            </div>

            <div style={meta}>
              {notice && <span style={ok}>{notice}</span>}
              {err && <span style={bad}>{err}</span>}
            </div>

            <div style={row}>
              <button type="submit" disabled={saving} style={primary}>
                {saving ? 'Saving…' : 'Save'}
              </button>

              <button
                type="button"
                style={primary}
                onClick={() => {
                  // Route from the persisted snapshot
                  const step = nextOnboardingStep(userDoc || {});
                  nav(stepPath(step));
                }}
              >
                Continue onboarding
              </button>
            </div>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
