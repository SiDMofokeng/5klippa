// src/pages/admin/AdminSettingsPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { auth, db } from '../../firebaseConfig';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  limit,
  query,
  updateDoc,
  where,
  serverTimestamp,
} from 'firebase/firestore';

// ───────────────────────────────────────────────────────────────────────────────
// Small helpers (kept consistent with the rest of admin pages)
const wrap = { padding: '24px 0 80px' };
const pageMax = 980;
const card = {
  background: '#fff',
  borderRadius: 16,
  boxShadow: '0 8px 30px rgba(16,24,40,0.08)',
  padding: 16,
  maxWidth: pageMax,
  margin: '0 auto',
};
const h1 = { margin: 0, fontSize: 22, fontWeight: 800 };
const sub = { margin: '4px 0 0', color: '#6b7280', fontSize: 13 };
const section = { ...card, marginTop: 16 };
const label = { display: 'block', fontSize: 12, color: '#475569', marginBottom: 6 };
const row = { display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' };
const input = {
  height: 40,
  borderRadius: 8,
  border: '1px solid #d1d5db',
  padding: '0 12px',
  fontSize: 14,
};
const field = (w = 280) => ({ display: 'flex', flexDirection: 'column', gap: 6, minWidth: w });
const btn = (primary) => ({
  height: 40,
  borderRadius: 10,
  padding: '0 14px',
  border: primary ? 'none' : '1px solid #d1d5db',
  background: primary ? '#4A7CFF' : '#fff',
  color: primary ? '#fff' : '#111827',
  fontWeight: 700,
  cursor: 'pointer',
});
const mono12 = {
  fontFamily:
    'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,monospace',
  fontSize: 12,
  color: '#334155',
};
const pill = (c) => ({
  display: 'inline-block',
  padding: '4px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
  color: c === 'ok' ? '#065f46' : c === 'bad' ? '#991b1b' : '#1f2937',
  background:
    c === 'ok' ? '#ecfdf5' : c === 'bad' ? '#fee2e2' : 'rgba(148,163,184,0.15)',
});

// Pretty rand + date (same style you used elsewhere)
const fmtRand = (n) => `R ${Number(n || 0).toLocaleString('en-ZA')}`;
const fmtDate = (ts) => {
  if (!ts) return '—';
  const d = typeof ts?.toDate === 'function' ? ts.toDate() : new Date(ts);
  return d.toLocaleString('en-ZA');
};

// Try to locate your collection name for loans.
// Many places you used "applications"; elsewhere "loans".
// We'll prefer "applications" (what your AdminApplicationsPage shows), fall back to "loans".
async function pickLoansCollection() {
  const tryQ = async (name) => {
    const ref = collection(db, name);
    const snap = await getDocs(query(ref, limit(1)));
    return snap.size >= 0 ? name : null;
  };
  // If either exists, both calls succeed; default to 'applications'
  const first = await tryQ('applications');
  if (first) return 'applications';
  const second = await tryQ('loans');
  return second || 'applications';
}

export default function AdminSettingsPage() {
  const [err, setErr] = useState('');
  const [ok, setOk] = useState('');
  const [busy, setBusy] = useState(false);

  // Inputs
  const [loanId, setLoanId] = useState('');
  const [userUid, setUserUid] = useState('');
  const [creditScore, setCreditScore] = useState('');

  // Recent pending loans
  const [loansCol, setLoansCol] = useState('applications');
  const [pending, setPending] = useState([]);

  // Load 6 most recent pending applications for quick actions
  const loadPending = useMemo(
    () => async () => {
      setErr('');
      try {
        const colName = await pickLoansCollection();
        setLoansCol(colName);
        const ref = collection(db, colName);
        const snap = await getDocs(query(ref, where('status', '==', 'PENDING'), limit(6)));
        setPending(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      } catch (e) {
        // If there are no indexes or no matches, just show empty quietly.
        setPending([]);
      }
    },
    []
  );

  useEffect(() => {
    loadPending();
  }, [loadPending]);

  // ────────────────────────────────────────────────────────────────────────────
  // Technical actions
  async function approveLoan(id) {
    if (!id) return;
    setBusy(true); setErr(''); setOk('');
    try {
      const ref = doc(db, loansCol, id);
      const snap = await getDoc(ref);
      if (!snap.exists()) throw new Error('Loan not found.');
      await updateDoc(ref, {
        status: 'APPROVED',
        approvedAt: serverTimestamp(),
        approvedBy: auth?.currentUser?.uid || null,
      });
      setOk(`Loan ${id} approved.`);
      setLoanId('');
      await loadPending();
    } catch (e) {
      setErr(e.message || 'Failed to approve loan.');
    } finally {
      setBusy(false);
    }
  }

  async function declineLoan(id) {
    if (!id) return;
    setBusy(true); setErr(''); setOk('');
    try {
      const ref = doc(db, loansCol, id);
      const snap = await getDoc(ref);
      if (!snap.exists()) throw new Error('Loan not found.');
      await updateDoc(ref, {
        status: 'DECLINED',
        declinedAt: serverTimestamp(),
        declinedBy: auth?.currentUser?.uid || null,
      });
      setOk(`Loan ${id} declined.`);
      setLoanId('');
      await loadPending();
    } catch (e) {
      setErr(e.message || 'Failed to decline loan.');
    } finally {
      setBusy(false);
    }
  }

  async function setUserActive(uid, value) {
    if (!uid) return;
    setBusy(true); setErr(''); setOk('');
    try {
      const ref = doc(db, 'users', uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) throw new Error('User not found.');
      await updateDoc(ref, {
        isActive: !!value,
        updatedAt: serverTimestamp(),
        statusChangedBy: auth?.currentUser?.uid || null,
      });
      setOk(`User ${uid} ${value ? 'activated' : 'deactivated'}.`);
    } catch (e) {
      setErr(e.message || 'Failed to update user status.');
    } finally {
      setBusy(false);
    }
  }

  // ────────────────────────────────────────────────────────────────────────────
  // Financial/Compliance actions
  async function setKyc(uid, status) {
    if (!uid) return;
    setBusy(true); setErr(''); setOk('');
    try {
      const ref = doc(db, 'users', uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) throw new Error('User not found.');
      await updateDoc(ref, {
        'kyc.status': status,                 // 'VERIFIED' | 'REJECTED' | 'PENDING'
        'kyc.checkedAt': serverTimestamp(),
        'kyc.checkedBy': auth?.currentUser?.uid || null,
        updatedAt: serverTimestamp(),
      });
      setOk(`KYC for ${uid} set to ${status}.`);
    } catch (e) {
      setErr(e.message || 'Failed to update KYC.');
    } finally {
      setBusy(false);
    }
  }

  async function toggleBankVerified(uid, value) {
    if (!uid) return;
    setBusy(true); setErr(''); setOk('');
    try {
      const ref = doc(db, 'users', uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) throw new Error('User not found.');
      await updateDoc(ref, {
        bankVerified: !!value,
        bankCheckedAt: serverTimestamp(),
        bankCheckedBy: auth?.currentUser?.uid || null,
        updatedAt: serverTimestamp(),
      });
      setOk(`Bank verification for ${uid} ${value ? 'enabled' : 'disabled'}.`);
    } catch (e) {
      setErr(e.message || 'Failed to update bank verification.');
    } finally {
      setBusy(false);
    }
  }

  async function setUserCreditScore(uid, score) {
    if (!uid) return;
    const n = Number(score);
    if (!Number.isFinite(n) || n < 0) {
      setErr('Enter a valid numeric credit score.'); return;
    }
    setBusy(true); setErr(''); setOk('');
    try {
      const ref = doc(db, 'users', uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) throw new Error('User not found.');
      await updateDoc(ref, {
        'risk.creditScore': n,
        'risk.updatedAt': serverTimestamp(),
        'risk.updatedBy': auth?.currentUser?.uid || null,
        updatedAt: serverTimestamp(),
      });
      setOk(`Credit score for ${uid} set to ${n}.`);
      setCreditScore('');
    } catch (e) {
      setErr(e.message || 'Failed to set credit score.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={wrap}>
      <div style={card}>
        <h1 style={h1}>Settings</h1>
        <p style={sub}>Environment & admin tools.</p>
      </div>

      {/* TECHNICAL TOOLS */}
      <div style={section}>
        <h2 style={{ ...h1, fontSize: 18 }}>Technical tools</h2>
        <p style={sub}>Approve/decline applications and activate/deactivate users.</p>

        {/* Loan actions by ID */}
        <div style={{ marginTop: 12 }}>
          <div style={row}>
            <div style={field(360)}>
              <label style={label}>Loan/Application ID</label>
              <input
                style={{ ...input, width: 360 }}
                value={loanId}
                onChange={(e) => setLoanId(e.target.value)}
                placeholder="Paste loan/application document ID"
              />
            </div>
            <button type="button" style={btn(true)} disabled={busy || !loanId} onClick={() => approveLoan(loanId)}>
              Approve
            </button>
            <button type="button" style={btn(false)} disabled={busy || !loanId} onClick={() => declineLoan(loanId)}>
              Decline
            </button>
          </div>

          {/* Quick list of pending */}
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 13, color: '#64748b', marginBottom: 8 }}>
              Recent pending ({loansCol}) — quick actions:
            </div>
            {pending.length === 0 ? (
              <div style={{ fontSize: 14, color: '#475569' }}>No pending applications.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 8 }}>
                {pending.map((l) => (
                  <div key={l.id} style={{
                    display: 'contents',
                  }}>
                    <div style={{
                      background: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 10,
                      padding: '10px 12px',
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
                        <div>
                          <div style={{ fontWeight: 700 }}>{fmtRand(l.amount)} <span style={pill('')}>{l.term || '—'} mo</span></div>
                          <div style={mono12}>{l.id}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={pill(l.status === 'PENDING' ? '' : l.status === 'APPROVED' ? 'ok' : 'bad')}>
                            {l.status || '—'}
                          </div>
                          <div style={{ ...mono12, opacity: 0.9 }}>{fmtDate(l.createdAt)}</div>
                        </div>
                      </div>
                    </div>
                    <button type="button" style={{ ...btn(true), height: 38 }} disabled={busy} onClick={() => approveLoan(l.id)}>Approve</button>
                    <button type="button" style={{ ...btn(false), height: 38 }} disabled={busy} onClick={() => declineLoan(l.id)}>Decline</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Activate / Deactivate user */}
        <div style={{ marginTop: 18 }}>
          <div style={row}>
            <div style={field(360)}>
              <label style={label}>User UID</label>
              <input
                style={{ ...input, width: 360 }}
                value={userUid}
                onChange={(e) => setUserUid(e.target.value)}
                placeholder="Paste Firebase Auth UID / users doc id"
              />
            </div>
            <button type="button" style={btn(true)} disabled={busy || !userUid} onClick={() => setUserActive(userUid, true)}>
              Activate user
            </button>
            <button type="button" style={btn(false)} disabled={busy || !userUid} onClick={() => setUserActive(userUid, false)}>
              Deactivate user
            </button>
          </div>
        </div>
      </div>

      {/* FINANCIAL / COMPLIANCE */}
      <div style={section}>
        <h2 style={{ ...h1, fontSize: 18 }}>Financial / compliance</h2>
        <p style={sub}>Manual flags used by finance & compliance (these write to the user document).</p>

        {/* KYC */}
        <div style={{ marginTop: 12 }}>
          <div style={row}>
            <div style={field(360)}>
              <label style={label}>User UID (KYC)</label>
              <input
                style={{ ...input, width: 360 }}
                value={userUid}
                onChange={(e) => setUserUid(e.target.value)}
                placeholder="Paste user UID"
              />
            </div>
            <button type="button" style={btn(true)} disabled={busy || !userUid} onClick={() => setKyc(userUid, 'VERIFIED')}>
              Set KYC: VERIFIED
            </button>
            <button type="button" style={btn(false)} disabled={busy || !userUid} onClick={() => setKyc(userUid, 'REJECTED')}>
              Set KYC: REJECTED
            </button>
          </div>
        </div>

        {/* Bank verification */}
        <div style={{ marginTop: 12 }}>
          <div style={row}>
            <div style={field(360)}>
              <label style={label}>User UID (Bank verification)</label>
              <input
                style={{ ...input, width: 360 }}
                value={userUid}
                onChange={(e) => setUserUid(e.target.value)}
                placeholder="Paste user UID"
              />
            </div>
            <button type="button" style={btn(true)} disabled={busy || !userUid} onClick={() => toggleBankVerified(userUid, true)}>
              Mark bank verified
            </button>
            <button type="button" style={btn(false)} disabled={busy || !userUid} onClick={() => toggleBankVerified(userUid, false)}>
              Unverify bank
            </button>
          </div>
        </div>

        {/* Internal credit score */}
        <div style={{ marginTop: 12 }}>
          <div style={row}>
            <div style={field(360)}>
              <label style={label}>User UID (credit score)</label>
              <input
                style={{ ...input, width: 360 }}
                value={userUid}
                onChange={(e) => setUserUid(e.target.value)}
                placeholder="Paste user UID"
              />
            </div>
            <div style={field(160)}>
              <label style={label}>Credit score (number)</label>
              <input
                style={{ ...input, width: 160 }}
                value={creditScore}
                onChange={(e) => setCreditScore(e.target.value)}
                placeholder="e.g. 650"
              />
            </div>
            <button
              type="button"
              style={btn(true)}
              disabled={busy || !userUid || !creditScore}
              onClick={() => setUserCreditScore(userUid, creditScore)}
            >
              Save score
            </button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {(err || ok) && (
        <div style={{ ...card, marginTop: 16 }}>
          {err && <div style={{ color: '#b00020', fontSize: 14 }}>{err}</div>}
          {ok && <div style={{ color: '#065f46', fontSize: 14 }}>{ok}</div>}
        </div>
      )}
    </div>
  );
}
