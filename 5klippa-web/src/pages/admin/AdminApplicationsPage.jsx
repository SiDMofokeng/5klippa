// src/pages/admin/AdminApplicationsPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { db } from '../../firebaseConfig';
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  startAt,
  getDocs,
} from 'firebase/firestore';

const PAGE_SIZE = 10;

export default function AdminApplicationsPage() {
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState('');

  // pagination state
  const [page, setPage] = useState(0);                // 0-based
  const [hasNext, setHasNext] = useState(false);
  const hasPrev = page > 0;

  // we store the first doc of each page so we can go back with startAt()
  const [pageFirstDocs, setPageFirstDocs] = useState([]); // Array<DocSnapshot>
  const [lastVisible, setLastVisible] = useState(null);   // DocSnapshot of current page's last doc

  // ---------- helpers ----------
  const fmtAmount = (v) => {
    const n = Number(v || 0);
    return `R ${n.toLocaleString('en-ZA')}`;
  };

  const fmtDateTime = (ts) => {
    if (!ts) return '—';
    // Firestore Timestamp or ISO/string support
    const d =
      typeof ts?.toDate === 'function'
        ? ts.toDate()
        : typeof ts === 'string'
        ? new Date(ts)
        : ts instanceof Date
        ? ts
        : null;
    return d ? d.toLocaleString('en-ZA') : '—';
  };

  const StatusPill = ({ status }) => {
    const s = String(status || '').toLowerCase();
    const bg =
      s === 'approved' ? '#e8f8f0' :
      s === 'rejected' ? '#fdecec' :
      s === 'pending'  ? '#eef2ff' :
      s === 'cancelled'? '#f3f4f6' : '#eef8ff';
    const fg =
      s === 'approved' ? '#047857' :
      s === 'rejected' ? '#b42318' :
      s === 'pending'  ? '#334155' :
      s === 'cancelled'? '#6b7280' : '#0b63c5';

    return (
      <span style={{
        display:'inline-block',
        padding:'2px 10px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 700,
        background: bg,
        color: fg
      }}>
        {String(status || '—').toUpperCase()}
      </span>
    );
  };

  // ---------- core fetch ----------
  const baseQuery = useMemo(
    () => query(collection(db, 'applications'), orderBy('createdAt', 'desc')),
    []
  );

  async function loadFirstPage() {
    setErr('');
    setBusy(true);
    try {
      // fetch +1 to detect if there is a next page
      const q = query(baseQuery, limit(PAGE_SIZE + 1));
      const snap = await getDocs(q);

      const docs = snap.docs.slice(0, PAGE_SIZE);
      setRows(docs.map(d => ({ id: d.id, ...d.data() })));
      setLastVisible(docs.length ? docs[docs.length - 1] : null);
      setPage(0);
      setPageFirstDocs(docs.length ? [docs[0]] : []);
      setHasNext(snap.docs.length > PAGE_SIZE);
    } catch (e) {
      setErr(e.message || 'Failed to load applications');
    } finally {
      setBusy(false);
    }
  }

  async function loadNext() {
    if (!lastVisible) return;
    setErr('');
    setBusy(true);
    try {
      const q = query(baseQuery, startAfter(lastVisible), limit(PAGE_SIZE + 1));
      const snap = await getDocs(q);
      const docs = snap.docs.slice(0, PAGE_SIZE);

      setRows(docs.map(d => ({ id: d.id, ...d.data() })));
      setLastVisible(docs.length ? docs[docs.length - 1] : null);

      // remember the first doc of this page so we can go back
      setPageFirstDocs(prev => [...prev, docs[0]]);
      setPage(p => p + 1);
      setHasNext(snap.docs.length > PAGE_SIZE);
    } catch (e) {
      setErr(e.message || 'Failed to load next page');
    } finally {
      setBusy(false);
    }
  }

  async function loadPrev() {
    if (!hasPrev) return;
    setErr('');
    setBusy(true);
    try {
      // previous page's first doc lives at pageFirstDocs[page-1]
      const prevFirst = pageFirstDocs[page - 1];
      const q = query(baseQuery, startAt(prevFirst), limit(PAGE_SIZE + 1));
      const snap = await getDocs(q);
      const docs = snap.docs.slice(0, PAGE_SIZE);

      setRows(docs.map(d => ({ id: d.id, ...d.data() })));
      setLastVisible(docs.length ? docs[docs.length - 1] : null);

      // move pointer one page back, don't drop the remembered cursors so user can go forward again
      setPage(p => p - 1);

      // we are not sure if there is a next page after going back, so re-evaluate:
      setHasNext(snap.docs.length > PAGE_SIZE || !!lastVisible);
    } catch (e) {
      setErr(e.message || 'Failed to load previous page');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    loadFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------- styles ----------
  const wrap = { padding: '24px 0 80px' };
  const card = {
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 8px 30px rgba(16,24,40,0.08)',
    padding: 16,
    maxWidth: 980,
    margin: '0 auto'
  };
  const headerRow = {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 8
  };
  const h2 = { margin: 0, fontSize: 22, fontWeight: 800 };
  const sub = { margin: 0, color: '#6b7280', fontSize: 13 };

  const table = { width: '100%', borderCollapse: 'separate', borderSpacing: 0 };
  const th = {
    textAlign: 'left',
    fontSize: 12,
    color: '#64748b',
    padding: '12px 14px',
    borderBottom: '1px solid #e5e7eb',
    whiteSpace: 'nowrap'
  };
  const td = {
    fontSize: 14,
    padding: '14px',
    borderBottom: '1px solid #f1f5f9',
    verticalAlign: 'middle'
  };
  const mono = { fontFamily: 'ui-monospace,SFMono-Regular,Menlo,Monaco,monospace', fontSize: 12, color: '#334155' };

  const pagerRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12 };
  const btn = (primary) => ({
    height: 36,
    borderRadius: 8,
    padding: '0 12px',
    border: primary ? 'none' : '1px solid #d1d5db',
    background: primary ? '#4A7CFF' : '#fff',
    color: primary ? '#fff' : '#111827',
    fontWeight: 600,
    cursor: 'pointer'
  });
  const disabledBtn = { opacity: 0.5, cursor: 'not-allowed' };

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={headerRow}>
          <div>
            <h2 style={h2}>Applications</h2>
            <p style={sub}>All loan applications, 10 per page.</p>
          </div>

          <div style={{ display:'flex', gap:8 }}>
            <button
              style={{ ...btn(false), ...(hasPrev ? {} : disabledBtn) }}
              disabled={!hasPrev || busy}
              onClick={loadPrev}
              type="button"
            >
              ← Prev
            </button>
            <button
              style={{ ...btn(true), ...(hasNext ? {} : disabledBtn) }}
              disabled={!hasNext || busy}
              onClick={loadNext}
              type="button"
            >
              Next →
            </button>
          </div>
        </div>

        {err && (
          <div style={{ color:'#b00020', fontSize:13, marginBottom:10 }}>
            {err}
          </div>
        )}

        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Amount</th>
              <th style={th}>Term</th>
              <th style={th}>Status</th>
              <th style={th}>Borrower UID</th>
              <th style={th}>Created</th>
              <th style={th}>Purpose</th>
            </tr>
          </thead>
          <tbody>
            {busy && rows.length === 0 ? (
              <tr>
                <td style={td} colSpan={6}>Loading…</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td style={td} colSpan={6}>No applications yet.</td>
              </tr>
            ) : (
              rows.map((a) => {
                const termLabel =
                  a.termMonths != null ? `${a.termMonths} mo` :
                  a.term != null ? `${a.term} mo` : '—';

                return (
                  <tr key={a.id}>
                    <td style={td}>{fmtAmount(a.amount)}</td>
                    <td style={td}>{termLabel}</td>
                    <td style={td}><StatusPill status={a.status} /></td>
                    <td style={td}><span style={mono}>{a.borrowerId || a.borrowerUID || a.userUid || '—'}</span></td>
                    <td style={td}>{fmtDateTime(a.createdAt)}</td>
                    <td style={td}>
                      {a.purpose ? (a.purpose.length > 36 ? a.purpose.slice(0, 36) + '…' : a.purpose) : '—'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div style={pagerRow}>
          <span style={{ color:'#64748b', fontSize:12 }}>
            Page {page + 1}{busy ? ' • loading…' : ''}
          </span>
          <div style={{ display:'flex', gap:8 }}>
            <button
              style={{ ...btn(false), ...(hasPrev ? {} : disabledBtn) }}
              disabled={!hasPrev || busy}
              onClick={loadPrev}
              type="button"
            >
              ← Prev
            </button>
            <button
              style={{ ...btn(true), ...(hasNext ? {} : disabledBtn) }}
              disabled={!hasNext || busy}
              onClick={loadNext}
              type="button"
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
