// 5klippa-web/src/pages/WalletPage.jsx
import React, { useEffect, useState } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import {
  doc,
  onSnapshot,
  setDoc,
  runTransaction,
  serverTimestamp,
  increment,
} from 'firebase/firestore';

export default function WalletPage() {
  const nav = useNavigate();
  const [uid, setUid] = useState(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState(false);
  const [err, setErr] = useState('');

  // 1) Auth: get user id (modular API)
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) {
        nav('/login', { replace: true });
        return;
      }
      setUid(u.uid);
    });
    return () => unsub();
  }, [nav]);

  // 2) Wallet subscription once we have uid
  useEffect(() => {
    if (!uid) return;
    setLoading(true);
    const ref = doc(db, 'wallets', uid);
    const unsub = onSnapshot(
      ref,
      (snap) => {
        setBalance(Number(snap.data()?.balance || 0));
        setLoading(false);
      },
      (e) => {
        setErr(e.message || 'Failed to load wallet');
        setLoading(false);
      }
    );
    return () => unsub();
  }, [uid]);

  const fmtZAR = (n) =>
    new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(Number.isFinite(n) ? n : 0);

  const topUp100 = async () => {
    if (!uid) return;
    setErr('');
    setWorking(true);
    try {
      const ref = doc(db, 'wallets', uid);
      await setDoc(
        ref,
        {
          balance: increment(100),
          owner: uid,
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );
    } catch (e) {
      setErr(e.message || 'Failed to top up');
    } finally {
      setWorking(false);
    }
  };

  const withdraw100 = async () => {
    if (!uid) return;
    setErr('');
    setWorking(true);
    try {
      const ref = doc(db, 'wallets', uid);
      await runTransaction(db, async (tx) => {
        const snap = await tx.get(ref);
        const cur = snap.exists() ? Number(snap.data().balance || 0) : 0;
        const next = Math.max(0, cur - 100); // never below zero
        tx.set(
          ref,
          { balance: next, owner: uid, updatedAt: serverTimestamp() },
          { merge: true }
        );
      });
    } catch (e) {
      setErr(e.message || 'Failed to withdraw');
    } finally {
      setWorking(false);
    }
  };

  // styles (match dashboard)
  const wrap = { maxWidth: 760, margin: '0 auto' };
  const card = {
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 8px 30px rgba(16,24,40,0.08)',
    padding: 24,
  };
  const header = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  };
  const h2 = { margin: 0, fontSize: 22, fontWeight: 700, color: '#1f274d' };
  const bal = { fontSize: 34, fontWeight: 800, margin: '6px 0 12px' };
  const row = { display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' };
  const primary = {
    height: 44,
    borderRadius: 10,
    background: '#4A7CFF',
    color: '#fff',
    border: 'none',
    fontWeight: 600,
    padding: '0 16px',
    cursor: 'pointer',
  };
  const ghost = {
    height: 44,
    borderRadius: 10,
    background: '#f6f8ff',
    color: '#334155',
    border: '1px solid #e6eaf9',
    fontWeight: 600,
    padding: '0 16px',
    cursor: 'pointer',
  };
  const meta = { minHeight: 20, marginTop: 8, fontSize: 13 };
  const bad = { color: '#b00020' };
  const hint = { color: '#475569' };

  return (
    <DashboardLayout>
      <div style={wrap}>
        <div style={header}>
          <h2 style={h2}>Wallet</h2>
        </div>

        <div style={card}>
          {loading ? (
            <div>Loading…</div>
          ) : (
            <>
              <div style={hint}>Available balance</div>
              <div style={bal}>{fmtZAR(balance)}</div>

              <div style={row}>
                <button
                  style={primary}
                  onClick={topUp100}
                  disabled={working}
                >
                  {working ? 'Working…' : 'Top up R100'}
                </button>
                <button
                  style={ghost}
                  onClick={withdraw100}
                  disabled={working || balance <= 0}
                >
                  {working ? 'Working…' : 'Withdraw R100'}
                </button>
              </div>

              <div style={meta}>{err && <span style={bad}>{err}</span>}</div>
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
