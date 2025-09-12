// 5klippa-web/src/pages/LoanDetailPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DashboardLayout from '../components/DashboardLayout';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function LoanDetailPage() {
  const nav = useNavigate();
  const { id } = useParams();

  const [loan, setLoan] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) { nav('/login', { replace: true }); return; }
      try {
        const ref = doc(db, 'applications', id);
        const snap = await getDoc(ref);
        if (!snap.exists()) { setErr('Not found'); setLoading(false); return; }
        const data = snap.data();
        if (data.borrowerId && data.borrowerId !== u.uid) { setErr('Not found'); setLoading(false); return; }
        setLoan({ id: snap.id, ...data });
      } catch (e) {
        setErr(e.message || 'Failed to load');
      } finally {
        setLoading(false);
      }
    });
    return () => unsub();
  }, [id, nav]);

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

  const wrap = { maxWidth: 760, margin: '0 auto' };
  const back = { display: 'inline-block', marginBottom: 12, color: '#64748b', cursor: 'pointer' };
  const card = { background: '#fff', borderRadius: 16, boxShadow: '0 8px 30px rgba(16,24,40,0.08)', padding: 24 };
  const h2 = { margin: '0 0 12px', fontSize: 22, fontWeight: 700 };
  const grid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 };
  const full = { gridColumn: '1 / -1' };
  const label = { fontSize: 12, color: '#8891aa', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 };
  const val = { fontSize: 18, fontWeight: 700, color: '#1f274d' };
  const sub = { fontSize: 14, color: '#5d6785' };

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
      '#f3f4f6',
    color:
      status === 'approved' ? '#1a7f4b' :
      status === 'rejected' ? '#b42318' :
      status === 'active'   ? '#0b63c5' :
      '#111827',
  });

  return (
    <DashboardLayout>
      <div style={wrap}>
        <div style={back} onClick={() => nav('/loans')}>← Back to Loans</div>

        <div style={card}>
          {loading ? (
            <div>Loading…</div>
          ) : err ? (
            <div style={{ color: '#b00020' }}>{err}</div>
          ) : (
            <>
              <h2 style={h2}>Loan #{loan.id.slice(0, 6).toUpperCase()}</h2>

              <div style={grid}>
                <div>
                  <div style={label}>Amount</div>
                  <div style={val}>{fmtMoney(loan.amount)}</div>
                </div>

                <div>
                  <div style={label}>Term</div>
                  <div style={val}>{loan.term ? `${loan.term} months` : '—'}</div>
                </div>

                <div>
                  <div style={label}>Status</div>
                  <div><span style={statusChip(loan.status || 'pending')}>{(loan.status || 'pending').toUpperCase()}</span></div>
                </div>

                <div>
                  <div style={label}>Created</div>
                  <div style={sub}>{fmtDate(loan.createdAt)}</div>
                </div>

                <div style={full}>
                  <div style={label}>Purpose</div>
                  <div style={sub}>{loan.purpose || '—'}</div>
                </div>

                {/* Future sections: repayments schedule, documents, decisions, etc. */}
              </div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
