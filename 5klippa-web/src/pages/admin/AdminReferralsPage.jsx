// src/pages/admin/AdminReferralsPage.jsx
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

export default function AdminReferralsPage() {
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState('');

  // pagination state
  const [page, setPage] = useState(0);                // 0-based
  const [hasNext, setHasNext] = useState(false);
  const hasPrev = page > 0;

  // store first doc of each page so we can navigate back using startAt()
  const [pageFirstDocs, setPageFirstDocs] = useState([]); // Array<DocSnapshot>
  const [lastVisible, setLastVisible] = useState(null);   // DocSnapshot of current page's last doc

  // ---------- helpers ----------
  const fmtDateTime = (ts) => {
    if (!ts) return '—';
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

  const StatusPill = ({ active }) => {
    const on = Boolean(active);
    return (
      <span
        style={{
          display: 'inline-block',
          padding: '2px 10px',
          borderRadius: 999,
          fontSize: 12,
          fontWeight: 700,
          background: on ? '#e8f8f0' : '#fdecec',
          color: on ? '#047857' : '#b42318',
        }}
      >
        {on ? 'ACTIVE' : 'INACTIVE'}
      </span>
    );
  };

  const mono = {
    fontFamily:
      'ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,Liberation Mono,monospace',
    fontSize: 12,
    color: '#334155',
  };

  async function copyText(t) {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(t);
        return;
      }
    } catch {}
    // fallback
    window.prompt('Copy code:', t);
  }

  // ---------- core fetch ----------
  const baseQuery = useMemo(
    () => query(collection(db, 'referrals'), orderBy('createdAt', 'desc')),
    []
  );

  async function loadFirstPage() {
    setErr('');
    setBusy(true);
    try {
      const q = query(baseQuery, limit(PAGE_SIZE + 1));
      const snap = await getDocs(q);

      const docs = snap.docs.slice(0, PAGE_SIZE);
      setRows(docs.map(d => ({ id: d.id, ...d.data() })));
      setLastVisible(docs.length ? docs[docs.length - 1] : null);
      setPage(0);
      setPageFirstDocs(docs.length ? [docs[0]] : []);
      setHasNext(snap.docs.length > PAGE_SIZE);
    } catch (e) {
      setErr(e.message || 'Failed to load referrals');
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
      const prevFirst = pageFirstDocs[page - 1];
      const q = query(baseQuery, startAt(prevFirst), limit(PAGE_SIZE + 1));
      const snap = await getDocs(q);
      const docs = snap.docs.slice(0, PAGE_SIZE);

      setRows(docs.map(d => ({ id: d.id, ...d.data() })));
      setLastVisible(docs.length ? docs[docs.length - 1] : null);
      setPage(p => p - 1);
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
    margin: '0 auto',
  };
  const headerRow = {
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

  const pillBtn = {
    height: 30,
    borderRadius: 999,
    padding: '0 12px',
    border: '1px solid #d1d5db',
    background: '#fff',
    color: '#111827',
    fontWeight: 600,
    cursor: 'pointer',
  };

  const pagerRow = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
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

  return (
    <div style={wrap}>
      <div style={card}>
        <div style={headerRow}>
          <div>
            <h2 style={h2}>Referrals</h2>
            <p style={sub}>All referral codes, 10 per page.</p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
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
          <div style={{ color: '#b00020', fontSize: 13, marginBottom: 10 }}>
            {err}
          </div>
        )}

        <table style={table}>
          <thead>
            <tr>
              <th style={th}>Code</th>
              <th style={th}>Owner UID</th>
              <th style={th}>Status</th>
              <th style={th}>Usage</th>
              <th style={th}>Created</th>
              <th style={th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {busy && rows.length === 0 ? (
              <tr>
                <td style={td} colSpan={6}>Loading…</td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td style={td} colSpan={6}>No referral codes yet.</td>
              </tr>
            ) : (
              rows.map((r) => {
                const code = r.code || r.id; // show field if present, else doc id
                const used = Number(r.usedCount || 0);
                const max = Number.isFinite(r.maxUses) ? r.maxUses : 1;
                return (
                  <tr key={r.id}>
                    <td style={td}><span style={mono}>{code}</span></td>
                    <td style={td}><span style={mono}>{r.ownerUid || '—'}</span></td>
                    <td style={td}><StatusPill active={r.active !== false} /></td>
                    <td style={td}>{used} / {max}</td>
                    <td style={td}>{fmtDateTime(r.createdAt)}</td>
                    <td style={td}>
                      <button
                        type="button"
                        style={pillBtn}
                        onClick={() => copyText(code)}
                        disabled={busy}
                      >
                        Copy
                      </button>
                    </td>
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
