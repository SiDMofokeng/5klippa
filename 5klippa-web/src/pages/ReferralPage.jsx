// 5klippa-web/src/pages/ReferralsPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import PageHeader from '../components/PageHeader';
import { auth, db } from '../firebaseConfig';
import {
  addDoc, collection, doc, onSnapshot, query, serverTimestamp, updateDoc, where,
} from 'firebase/firestore';

export default function ReferralsPage() {
  const nav = useNavigate();
  const [uid, setUid] = useState(null);
  const [codes, setCodes] = useState([]);
  const [n, setN] = useState(5);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((u) => {
      if (!u) { nav('/login', { replace: true }); return; }
      setUid(u.uid);

      const q = query(collection(db, 'referrals'), where('ownerUid', '==', u.uid));
      const stop = onSnapshot(q, (snap) => {
        const rows = [];
        snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));
        rows.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
        setCodes(rows);
      });
      return () => stop();
    });
    return () => unsub();
  }, [nav]);

  const plural = (count, word) => `${count} ${count === 1 ? word : `${word}s`}`;

  const summary = useMemo(() => {
    const total = codes.length;
    let used = 0;
    let remaining = 0;
    codes.forEach(c => {
      used += Number(c.usedCount || 0);
      remaining += Math.max(0, Number(c.usageLimit || 0) - Number(c.usedCount || 0));
    });
    return { total, used, remaining };
  }, [codes]);

  const primary = {
    height: 36, borderRadius: 10, background: '#4A7CFF', color: '#fff', border: 'none',
    fontWeight: 600, padding: '0 12px', cursor: 'pointer',
  };
  const ghost = {
    height: 36, borderRadius: 10, background: '#f6f8ff', color: '#334155',
    border: '1px solid #e6eaf9', fontWeight: 600, padding: '0 12px', cursor: 'pointer',
  };

  const card = { background: '#fff', borderRadius: 16, boxShadow: '0 8px 30px rgba(16,24,40,0.08)', padding: 24 };
  const pillOk = {
    display: 'inline-block', padding: '4px 10px', borderRadius: 999, background: '#ecfdf5', color: '#065f46', fontWeight: 600, fontSize: 12,
  };

  async function generateSingle10() {
    if (!uid) return;
    setBusy(true);
    try {
      // Let Firestore auto-generate an ID; we show that ID as the "code"
      await addDoc(collection(db, 'referrals'), {
        ownerUid: uid,
        active: true,
        usageLimit: 10,
        usedCount: 0,
        createdAt: serverTimestamp(),
      });
    } finally {
      setBusy(false);
    }
  }

  async function generateNOneUse() {
    if (!uid) return;
    const count = Math.max(1, Math.min(100, Number(n || 1)));
    setBusy(true);
    try {
      const batch = Array.from({ length: count });
      // sequential add (keeps it simple for now)
      for (let i = 0; i < batch.length; i += 1) {
        // each one-use code
        await addDoc(collection(db, 'referrals'), {
          ownerUid: uid,
          active: true,
          usageLimit: 1,
          usedCount: 0,
          createdAt: serverTimestamp(),
        });
      }
    } finally {
      setBusy(false);
    }
  }

  async function deactivate(id) {
    if (!id) return;
    const ok = window.confirm('Deactivate this code?');
    if (!ok) return;
    await updateDoc(doc(db, 'referrals', id), { active: false });
  }

  return (
    <DashboardLayout>
      <PageHeader title="Referrals">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="number"
            min={1}
            max={100}
            value={n}
            onChange={(e) => setN(e.target.value)}
            style={{ width: 64, height: 36, borderRadius: 8, border: '1px solid #e6eaf9', padding: '0 8px' }}
          />
          <button type="button" style={ghost} onClick={generateNOneUse} disabled={busy}>
            Generate N one-use codes
          </button>
          <button type="button" style={primary} onClick={generateSingle10} disabled={busy}>
            Generate single code (10 uses)
          </button>
        </div>
      </PageHeader>

      <div style={card}>
        <div style={{ marginBottom: 16, color: '#475569' }}>
          <strong>{plural(summary.total, 'code')}</strong>&nbsp;&nbsp;
          <span>{summary.used} used</span>&nbsp;&nbsp;
          <span>{summary.remaining} remaining</span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ textAlign: 'left', color: '#6b7280' }}>
                <th style={{ padding: '10px 8px' }}>Code</th>
                <th style={{ padding: '10px 8px' }}>Usage</th>
                <th style={{ padding: '10px 8px' }}>Active</th>
                <th style={{ padding: '10px 8px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {codes.map((c) => {
                const codeText = c.id; // using the Firestore ID as the visible code
                const usage = `${Number(c.usedCount || 0)} / ${Number(c.usageLimit || 0)}`;
                return (
                  <tr key={c.id} style={{ borderTop: '1px solid #eef2ff' }}>
                    <td style={{ padding: '12px 8px', fontWeight: 600 }}>{codeText}</td>
                    <td style={{ padding: '12px 8px' }}>
                      <span style={pillOk}>{usage}</span>
                    </td>
                    <td style={{ padding: '12px 8px' }}>{c.active ? 'Yes' : 'No'}</td>
                    <td style={{ padding: '12px 8px' }}>
                      {c.active && (
                        <button
                          type="button"
                          onClick={() => deactivate(c.id)}
                          style={{
                            height: 32, borderRadius: 8, background: '#fff5f5',
                            border: '1px solid #fecaca', color: '#b91c1c', fontWeight: 700, padding: '0 10px', cursor: 'pointer'
                          }}
                        >
                          Deactivate
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {codes.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: 16, color: '#6b7280' }}>No codes yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
