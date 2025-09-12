// src/pages/admin/AdminWalletPage.jsx
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

export default function AdminWalletPage() {
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState('');

  // pagination
  const [page, setPage] = useState(0);
  const [pageFirstDocs, setPageFirstDocs] = useState([]); // first doc per page (for startAt on Prev)
  const [lastVisible, setLastVisible] = useState(null);   // last doc of current page
  const [hasNext, setHasNext] = useState(false);
  const hasPrev = page > 0;

  // base query (newest updated first)
  const baseQ = useMemo(
    () => query(collection(db, 'wallets'), orderBy('updatedAt', 'desc')),
    []
  );

  // utils
  const fmtDateTime = (ts) => {
    if (!ts) return '—';
    const d =
      typeof ts?.toDate === 'function'
        ? ts.toDate()
        : ts instanceof Date
        ? ts
        : typeof ts === 'string'
        ? new Date(ts)
        : null;
    return d ? d.toLocaleString('en-ZA') : '—';
  };

  const fmtRand = (n) => {
    const x = typeof n === 'number' ? n : Number(n || 0);
    return `R ${x.toLocaleString('en-ZA')}`;
  };

  // data loaders
  async function loadFirst() {
    setErr('');
    setBusy(true);
    try {
      const snap = await getDocs(query(baseQ, limit(PAGE_SIZE + 1)));
      const docs = snap.docs.slice(0, PAGE_SIZE);
      setRows(docs.map(d => ({ id: d.id, ...d.data() })));
      setLastVisible(docs.length ? docs[docs.length - 1] : null);
      setPage(0);
      setPageFirstDocs(docs.length ? [docs[0]] : []);
      setHasNext(snap.docs.length > PAGE_SIZE);
    } catch (e) {
      setErr(e.message || 'Failed to load wallets.');
    } finally {
      setBusy(false);
    }
  }

  async function loadNext() {
    if (!lastVisible) return;
    setErr('');
    setBusy(true);
    try {
      const snap = await getDocs(
        query(baseQ, startAfter(lastVisible), limit(PAGE_SIZE + 1))
      );
      const docs = snap.docs.slice(0, PAGE_SIZE);
      setRows(docs.map(d => ({ id: d.id, ...d.data() })));
      setLastVisible(docs.length ? docs[docs.length - 1] : null);
      setPageFirstDocs(prev => [...prev, docs[0]]);
      setPage(p => p + 1);
      setHasNext(snap.docs.length > PAGE_SIZE);
    } catch (e) {
      setErr(e.message || 'Failed to load next page.');
    } finally {
      setBusy(false);
    }
  }

  async function loadPrev() {
    if (!hasPrev) return;
    setErr('');
    setBusy(true);
    try {
      const prevFirst = pageFirstDocs[page - 1];
      const snap = await getDocs(
        query(baseQ, startAt(prevFirst), limit(PAGE_SIZE + 1))
      );
      const docs = snap.docs.slice(0, PAGE_SIZE);
      setRows(docs.map(d => ({ id: d.id, ...d.data() })));
      setLastVisible(docs.length ? docs[docs.length - 1] : null);
      setPage(p => p - 1);
      setHasNext(snap.docs.length > PAGE_SIZE);
    } catch (e) {
      setErr(e.message || 'Failed to load previous page.');
    } finally {
      setBusy(false);
    }
  }

  useEffect(() => {
    loadFirst();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // styles (kept consistent with other admin pages)
  const wrap = { padding: '24px 0 80px' };
  const card = {
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 8px 30px rgba(16,24,40,0.08)',
    padding: 16,
    maxWidth: 980,
    margin: '0 auto',
  };
  const headRow = {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 8,
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
    whiteSpace: 'nowrap',
  };
  const td = {
    fontSize: 14,
    padding: '14px',
    borderBottom: '1px solid #f1f5f9',
    verticalAlign: 'middle',
  };
  const mono = {
    fontFamily:
      'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,monospace',
    fontSize: 12,
    color: '#334155',
  };

  const btn = (primary) => ({
    height: 36,
    borderRadius: 8,
    padding: '0 12px',
    border: primary ? 'none' : '1px solid #d1d5db',
    background: primary ? '#4A7CFF' : '#fff',
    color: primary ? '#fff' : '#111827',
    fontWeight: 600,
    cursor: 'pointer',
  });
  const disabledBtn = { opacity: 0.5, cursor: 'not-allowed' };

  const pagerRow = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
  };

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={headRow}>
          <div>
            <h2 style={h2}>Wallets</h2>
            <p style={sub}>All user wallet balances (10 per page).</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              style={{ ...btn(false), ...(hasPrev ? {} : disabledBtn) }}
              disabled={!hasPrev || busy}
              onClick={loadPrev}
            >
              ← Prev
            </button>
            <button
              type="button"
              style={{ ...btn(true), ...(hasNext ? {} : disabledBtn) }}
              disabled={!hasNext || busy}
              onClick={loadNext}
            >
              Next →
            </button>
          </div>
        </div>

        {err && (
          <div style={{ color: '#b00020', fontSize: 13, marginBottom: 10 }}>
            {err}
          </div>
        )}

        <table style={table}>
          <thead>
            <tr>
              <th style={th}>User UID</th>
              <th style={th}>Balance</th>
              <th style={th}>Last updated</th>
            </tr>
          </thead>
          <tbody>
            {busy && rows.length === 0 ? (
              <tr>
                <td style={td} colSpan={3}>Loading…</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td style={td} colSpan={3}>No wallets yet.</td>
              </tr>
            ) : (
              rows.map(w => {
                const uid = w.userUid || w.id;
                return (
                  <tr key={w.id}>
                    <td style={td}><span style={mono}>{uid}</span></td>
                    <td style={td}>{fmtRand(w.balance)}</td>
                    <td style={td}>{fmtDateTime(w.updatedAt)}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <div style={pagerRow}>
          <span style={{ color: '#64748b', fontSize: 12 }}>
            Page {page + 1}{busy ? ' • loading…' : ''}
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              type="button"
              style={{ ...btn(false), ...(hasPrev ? {} : disabledBtn) }}
              disabled={!hasPrev || busy}
              onClick={loadPrev}
            >
              ← Prev
            </button>
            <button
              type="button"
              style={{ ...btn(true), ...(hasNext ? {} : disabledBtn) }}
              disabled={!hasNext || busy}
              onClick={loadNext}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
