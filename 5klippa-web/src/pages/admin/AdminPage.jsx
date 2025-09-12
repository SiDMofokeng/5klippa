// 5klippa-web/src/pages/admin/AdminPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../components/DashboardLayout';
import { auth, db } from '../../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import {
  collection, doc, getDoc, getDocs, orderBy, query, updateDoc
} from 'firebase/firestore';

export default function AdminPage() {
  const nav = useNavigate();

  const [uid, setUid] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checking, setChecking] = useState(true);

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState('all'); // all | pending | approved | cancelled

  // auth + admin check
  useEffect(() => {
    const off = onAuthStateChanged(auth, async (u) => {
      if (!u) { nav('/login', { replace: true }); return; }
      setUid(u.uid);
      try {
        const r = await getDoc(doc(db, 'meta', 'roles'));
        const ok = r.exists() && r.data()?.admins?.[u.uid] === true;
        setIsAdmin(!!ok);
      } catch {
        setIsAdmin(false);
      } finally {
        setChecking(false);
      }
    });
    return () => off();
  }, [nav]);

  // load all applications (admin rules grant access)
  useEffect(() => {
    if (!isAdmin || checking) return;
    (async () => {
      setErr('');
      setLoading(true);
      try {
        const q = query(collection(db, 'applications'), orderBy('createdAt', 'desc'));
        const snap = await getDocs(q);
        const data = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        setRows(data);
      } catch (e) {
        setErr(e.message || 'Failed to load applications.');
      } finally {
        setLoading(false);
      }
    })();
  }, [isAdmin, checking]);

  const filtered = useMemo(() => {
    if (filter === 'all') return rows;
    return rows.filter(r => (r.status || 'pending') === filter);
  }, [rows, filter]);

  // actions
  const mutate = async (id, status) => {
    try {
      await updateDoc(doc(db, 'applications', id), { status });
      setRows((old) => old.map(x => (x.id === id ? { ...x, status } : x)));
    } catch (e) {
      alert(e.message || 'Update failed');
    }
  };

  // styles (match your app)
  const shell = { maxWidth: 1100, margin: '0 auto' };
  const card = { background: '#fff', borderRadius: 16, boxShadow: '0 8px 30px rgba(16,24,40,0.08)', padding: 24 };
  const h2 = { margin: 0, fontSize: 22, fontWeight: 700 };
  const row = {
    display: 'grid',
    gridTemplateColumns: '1.2fr .8fr 1fr 1fr 1fr',
    gap: 12,
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #eef2ff'
  };
  const head = { ...row, fontSize: 12, color: '#64748b', textTransform: 'uppercase', letterSpacing: '.04em' };
  const badge = (s) => ({
    display: 'inline-block', padding: '4px 8px', borderRadius: 999,
    background: s === 'approved' ? '#e8f5e9' : s === 'cancelled' ? '#fee2e2' : '#eef2ff',
    color: s === 'approved' ? '#177245' : s === 'cancelled' ? '#b00020' : '#334155',
    fontWeight: 700, fontSize: 12,
    textTransform: 'capitalize'
  });
  const pill = (active) => ({
    height: 36, borderRadius: 10, border: '1px solid #e6eaf9',
    background: active ? '#4A7CFF' : '#f6f8ff',
    color: active ? '#fff' : '#334155',
    fontWeight: 600, padding: '0 12px', cursor: 'pointer'
  });

  if (checking) {
    return (
      <DashboardLayout>
        <div style={shell}><div style={card}>Checking permissions…</div></div>
      </DashboardLayout>
    );
  }

  if (!isAdmin) {
    return (
      <DashboardLayout>
        <div style={shell}>
          <div style={card}>
            <h2 style={h2}>Admin</h2>
            <p style={{ color: '#b00020' }}>Not authorized.</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div style={shell}>
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={h2}>Admin — Applications</h2>
            <div style={{ display: 'flex', gap: 8 }}>
              <button style={pill(filter === 'all')} onClick={() => setFilter('all')}>All</button>
              <button style={pill(filter === 'pending')} onClick={() => setFilter('pending')}>Pending</button>
              <button style={pill(filter === 'approved')} onClick={() => setFilter('approved')}>Approved</button>
              <button style={pill(filter === 'cancelled')} onClick={() => setFilter('cancelled')}>Cancelled</button>
            </div>
          </div>

          {err && <div style={{ color: '#b00020', marginTop: 12 }}>{err}</div>}

          <div style={{ marginTop: 16 }}>
            <div style={head}>
              <div>Borrower</div>
              <div>Amount</div>
              <div>Term</div>
              <div>Status</div>
              <div>Actions</div>
            </div>

            {loading ? (
              <div style={{ padding: '18px 0' }}>Loading…</div>
            ) : filtered.length === 0 ? (
              <div style={{ padding: '18px 0', color: '#64748b' }}>No applications.</div>
            ) : (
              filtered.map((a) => (
                <div key={a.id} style={row}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{a.borrowerName || '—'}</div>
                    <div style={{ color: '#64748b', fontSize: 12 }}>{a.borrowerEmail || a.borrowerId || ''}</div>
                  </div>
                  <div>{(a.currency || 'R') + ' ' + Number(a.amount || 0).toLocaleString()}</div>
                  <div>{(a.termMonths || a.term || 0) + ' mo'}</div>
                  <div><span style={badge(a.status || 'pending')}>{a.status || 'pending'}</span></div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <Link to={`/loans/${a.id}`} style={{ textDecoration: 'none' }}>
                      <button style={pill(false)}>View</button>
                    </Link>
                    <button style={pill(false)} onClick={() => mutate(a.id, 'approved')}>Approve</button>
                    <button style={pill(false)} onClick={() => mutate(a.id, 'cancelled')}>Cancel</button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
