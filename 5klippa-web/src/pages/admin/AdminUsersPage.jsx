// src/admin/AdminUsersPage.jsx
import React, { useEffect, useRef, useState } from 'react';
import { db } from '../../firebaseConfig';
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
} from 'firebase/firestore';

const PAGE_SIZE = 10;

export default function AdminUsersPage() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [hasNext, setHasNext] = useState(false);

  // Stack of cursors used to fetch each page.
  // pageStack[0] === null (the very first page).
  const pageStackRef = useRef([null]);
  const lastVisibleRef = useRef(null); // last doc of current page (for Next)

  const pageNum = pageStackRef.current.length; // 1-based

  useEffect(() => {
    // load first page on mount
    loadPage(pageStackRef.current[pageStackRef.current.length - 1]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadPage(startAfterDoc) {
    setLoading(true);
    setErr('');

    try {
      const baseQ = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc')
      );

      // We ask for +1 to know if there is a next page
      const q = startAfterDoc
        ? query(baseQ, startAfter(startAfterDoc), limit(PAGE_SIZE + 1))
        : query(baseQ, limit(PAGE_SIZE + 1));

      const snap = await getDocs(q);
      const docs = snap.docs;

      // determine if there is a next page
      setHasNext(docs.length > PAGE_SIZE);

      // actual rows for this page
      const pageDocs = docs.slice(0, PAGE_SIZE);
      setRows(pageDocs.map(d => ({ id: d.id, _snap: d, ...d.data() })));

      // save the last visible to use as the next cursor
      lastVisibleRef.current = pageDocs[pageDocs.length - 1] || null;
    } catch (e) {
      setErr(e.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  function fmt(ts) {
    if (!ts) return '—';
    const d = ts.toDate ? ts.toDate() : new Date(ts);
    return d.toLocaleString([], {
      year: 'numeric', month: '2-digit', day: '2-digit',
      hour: '2-digit', minute: '2-digit'
    });
  }

  async function handleNext() {
    if (!hasNext || !lastVisibleRef.current) return;
    // push the cursor (last of current page) and load next
    pageStackRef.current.push(lastVisibleRef.current);
    await loadPage(lastVisibleRef.current);
  }

  async function handlePrev() {
    if (pageStackRef.current.length <= 1) return; // already at first
    // drop the current cursor and load the previous page using the new tail
    pageStackRef.current.pop();
    const prevCursor = pageStackRef.current[pageStackRef.current.length - 1];
    await loadPage(prevCursor);
  }

  // --------------- layout styles (match the other admin pages) ---------------
  const page = { maxWidth: 1100, margin: '0 auto', padding: '24px 16px' };
  const h1 = { margin: '0 0 6px', fontSize: 22, fontWeight: 700 };
  const sub = { margin: '0 0 18px', color: '#667085' };
  const card = {
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 8px 30px rgba(16,24,40,0.08)',
    padding: 16
  };
  const table = { width: '100%', borderCollapse: 'collapse' };
  const th = {
    fontSize: 12,
    textAlign: 'left',
    color: '#667085',
    padding: '12px 14px',
    borderBottom: '1px solid #EEF2F6',
    whiteSpace: 'nowrap'
  };
  const td = {
    fontSize: 14,
    color: '#101828',
    padding: '12px 14px',
    borderBottom: '1px solid #F2F4F7',
    verticalAlign: 'middle'
  };
  const pill = {
    display: 'inline-flex',
    alignItems: 'center',
    height: 22,
    padding: '0 8px',
    borderRadius: 999,
    background: '#F2F4F7',
    color: '#667085',
    fontSize: 12
  };
  const pager = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14
  };
  const btn = (primary) => ({
    height: 34,
    padding: '0 12px',
    borderRadius: 8,
    border: primary ? 'none' : '1px solid #E4E7EC',
    background: primary ? '#4A7CFF' : '#F9FAFB',
    color: primary ? '#fff' : '#344054',
    cursor: 'pointer',
    fontWeight: 600
  });
  const btnDisabled = { opacity: 0.6, cursor: 'not-allowed' };

  return (
    <main className="admin-main">
      <div style={page}>
        <h1 style={h1}>Users</h1>
        <p style={sub}>Latest sign-ups. Page size: {PAGE_SIZE}.</p>

        {err && <div style={{ color: '#b00020', fontSize: 13, marginBottom: 10 }}>{err}</div>}

        <div style={card}>
          <div style={{ overflowX: 'auto' }}>
            <table style={table}>
              <thead>
                <tr>
                  <th style={{ ...th, minWidth: 260 }}>Email</th>
                  <th style={th}>Created</th>
                  <th style={th}>Onboarding</th>
                  <th style={th}>Referral</th>
                  <th style={{ ...th, minWidth: 340 }}>UID</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td style={{ ...td, color: '#667085' }} colSpan={5}>Loading…</td></tr>
                ) : rows.length === 0 ? (
                  <tr><td style={{ ...td, color: '#667085' }} colSpan={5}>No users.</td></tr>
                ) : (
                  rows.map((u) => (
                    <tr key={u.id}>
                      <td style={td}>{u.email || '—'}</td>
                      <td style={td}>{fmt(u.createdAt)}</td>
                      <td style={td}>
                        {u.onboarding?.currentStep
                          ? <span style={pill}>{u.onboarding.currentStep}</span>
                          : '—'}
                      </td>
                      <td style={td}>
                        {u.referral?.code || u.referralCodeUsed || '—'}
                      </td>
                      <td style={td} title={u.id}>{u.id}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* pager */}
          <div style={pager}>
            <div style={{ color: '#667085', fontSize: 13 }}>
              Page <b>{pageNum}</b>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                type="button"
                onClick={handlePrev}
                style={{ ...btn(false), ...(pageNum === 1 ? btnDisabled : {}) }}
                disabled={pageNum === 1}
              >
                ← Previous
              </button>
              <button
                type="button"
                onClick={handleNext}
                style={{ ...btn(true), ...(!hasNext ? btnDisabled : {}) }}
                disabled={!hasNext}
              >
                Next →
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
