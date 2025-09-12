// 5klippa-web/src/pages/LoansPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { auth, db } from '../firebaseConfig';
import {
  collection, onSnapshot, query, where, doc, updateDoc, serverTimestamp,
} from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import PageHeader from '../components/PageHeader';

export default function LoansPage() {
  const nav = useNavigate();
  const [uid, setUid] = useState(null);
  const [loans, setLoans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [workingId, setWorkingId] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { nav('/login', { replace: true }); return; }
      setUid(u.uid);
    });
    return () => unsub();
  }, [nav]);

  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, 'applications'), where('borrowerId', '==', uid));
    const unsub = onSnapshot(q, (snap) => {
      const rows = [];
      snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));
      rows.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
      setLoans(rows);
      setLoading(false);
    }, (err) => {
      setErrorMsg(err.message || 'Failed to load loans');
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  const fmtMoney = (n) =>
    typeof n === 'number'
      ? new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR', maximumFractionDigits: 0 }).format(n)
      : '—';

  const fmtDate = (ts) => {
    try {
      if (!ts?.toDate) return '—';
      const d = ts.toDate();
      return d.toLocaleDateString('en-ZA', { year: 'numeric', month: 'short', day: 'numeric' });
    } catch { return '—'; }
  };

  async function cancelLoan(id) {
    if (!id) return;
    const ok = window.confirm('Cancel this application? This cannot be undone.');
    if (!ok) return;

    setErrorMsg('');
    setWorkingId(id);
    try {
      await updateDoc(doc(db, 'applications', id), {
        status: 'cancelled',
        cancelledAt: serverTimestamp(),
      });
    } catch (e) {
      const msg = e?.message || 'Failed to cancel';
      setErrorMsg(msg);
      alert(msg); // surface immediately
    } finally {
      setWorkingId('');
    }
  }

  const header = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 };
  const h2 = { margin: 0, fontSize: 22, fontWeight: 700, color: '#1f274d' };
  const primaryBtn = {
    height: 42, padding: '0 14px', borderRadius: 10, border: 'none',
    background: '#4A7CFF', color: '#fff', fontWeight: 600, cursor: 'pointer'
  };

  const empty = {
    background: '#fff', borderRadius: 16, padding: 24,
    textAlign: 'center', color: '#475569', boxShadow: '0 8px 30px rgba(16,24,40,0.08)'
  };

  const list = { display: 'grid', gap: 12 };
  const card = {
    background: '#fff', borderRadius: 16, padding: 16,
    boxShadow: '0 8px 30px rgba(16,24,40,0.08)', display: 'grid',
    gridTemplateColumns: '1fr 1fr 1fr 1fr auto', alignItems: 'center', gap: 12
  };

  const label = { fontSize: 12, color: '#8891aa', letterSpacing: 0.5, textTransform: 'uppercase' };
  const val = { fontSize: 16, fontWeight: 700, color: '#1f274d' };
  const sub = { fontSize: 13, color: '#5d6785' };

  const statusChip = (status) => ({
    display: 'inline-block',
    padding: '6px 10px',
    borderRadius: 999,
    fontWeight: 700,
    fontSize: 12,
    background:
      status === 'approved' ? '#e8f8f0' :
      status === 'rejected' ? '#fdecec' :
      status === 'active'   ? '#eef8ff' :
      status === 'cancelled'? '#f3f4f6' :
      '#f3f4f6',
    color:
      status === 'approved' ? '#1a7f4b' :
      status === 'rejected' ? '#b42318' :
      status === 'active'   ? '#0b63c5' :
      status === 'cancelled'? '#6b7280' :
      '#111827',
  });

  const ghostBtn = {
    padding: '8px 12px', borderRadius: 8, background: '#f2f5ff',
    border: '1px solid #e3e7ff', fontWeight: 600, cursor: 'pointer', color: '#2b3674', marginRight: 8
  };
  const dangerBtn = {
    padding: '8px 12px', borderRadius: 8, background: '#fff5f5',
    border: '1px solid #fecaca', fontWeight: 700, cursor: 'pointer', color: '#b91c1c'
  };

  return (
    <DashboardLayout>
      <PageHeader title="Loans">
        <button style={primaryBtn} onClick={() => nav('/new-loan')}>New application</button>
      </PageHeader>


      {errorMsg && (
        <div style={{ marginBottom: 12, color: '#b00020' }}>{errorMsg}</div>
      )}

      {loading ? (
        <div style={empty}>Loading…</div>
      ) : loans.length === 0 ? (
        <div style={empty}>
          <div style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>No loan applications yet</div>
          <div style={{ marginBottom: 16 }}>Start by submitting your first application.</div>
          <button style={primaryBtn} onClick={() => nav('/new-loan')}>Apply for a loan</button>
        </div>
      ) : (
        <div style={list}>
          {loans.map((row) => {
            const status = String(row.status || 'pending').toLowerCase();
            const canCancel = status === 'pending';
            const busy = workingId === row.id;

            return (
              <div key={row.id} style={card}>
                <div>
                  <div style={label}>AMOUNT</div>
                  <div style={val}>{fmtMoney(row.amount)}</div>
                </div>

                <div>
                  <div style={label}>TERM</div>
                  <div style={val}>{row.term ? `${row.term} mo` : '—'}</div>
                </div>

                <div>
                  <div style={label}>PURPOSE</div>
                  <div style={sub} title={row.purpose || ''}>
                    {row.purpose && row.purpose.length > 36 ? row.purpose.slice(0, 36) + '…' : (row.purpose || '—')}
                  </div>
                </div>

                <div>
                  <div style={label}>CREATED</div>
                  <div style={sub}>{fmtDate(row.createdAt)}</div>
                </div>

                <div style={{ textAlign: 'right' }}>
                  <div><span style={statusChip(status)}>{status.toUpperCase()}</span></div>
                  <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end' }}>
                    <button style={ghostBtn} onClick={() => nav(`/loans/${row.id}`)}>View</button>
                    {canCancel && (
                      <button
                        style={dangerBtn}
                        onClick={() => cancelLoan(row.id)}
                        disabled={busy}
                        title="Cancel this application"
                      >
                        {busy ? 'Cancelling…' : 'Cancel'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
