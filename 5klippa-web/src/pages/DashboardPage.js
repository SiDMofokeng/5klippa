// 5klippa-web/src/pages/DashboardPage.js
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import {
  doc, getDoc, onSnapshot, collection, query, where,
} from 'firebase/firestore';
import DashboardLayout from '../components/DashboardLayout';
import { nextOnboardingStep, stepPath } from '../utils/onboarding';

export default function DashboardPage() {
  const nav = useNavigate();

  const [uid, setUid] = useState(null);
  const [uDoc, setUDoc] = useState({});
  const [loading, setLoading] = useState(true);

  const [apps, setApps] = useState([]);
  const [refs, setRefs] = useState([]);
  const [wallet, setWallet] = useState(0);

  // Auth + all subscriptions (cleanly)
  useEffect(() => {
    const offAuth = auth.onAuthStateChanged(async (u) => {
      if (!u) { nav('/login', { replace: true }); return; }
      setUid(u.uid);

      // user doc once
      const snap = await getDoc(doc(db, 'users', u.uid));
      setUDoc(snap.exists() ? snap.data() : {});

      // apps
      const stopApps = onSnapshot(
        query(collection(db, 'applications'), where('borrowerId', '==', u.uid)),
        (s) => {
          const rows = [];
          s.forEach((d) => rows.push({ id: d.id, ...d.data() }));
          setApps(rows);
        }
      );

      // referrals
      const stopRefs = onSnapshot(
        query(collection(db, 'referrals'), where('ownerUid', '==', u.uid)),
        (s) => {
          const rows = [];
          s.forEach((d) => rows.push({ id: d.id, ...d.data() }));
          setRefs(rows);
        }
      );

      // wallet
      const stopWallet = onSnapshot(doc(db, 'wallets', u.uid), (s) => {
        setWallet(Number(s.data()?.balance || 0));
      });

      setLoading(false);

      // cleanup when auth user changes/unmounts
      return () => { stopApps(); stopRefs(); stopWallet(); };
    });

    return () => offAuth();
  }, [nav]);

  const get = (obj, path) =>
    path.split('.').reduce((acc, k) => (acc && acc[k] !== undefined ? acc[k] : undefined), obj);
  const isFilled = (v) => v !== undefined && v !== null && String(v).trim().length > 0;

  const REQUIRED = ['fullName', 'idNumber', 'phone', 'addressLine1', 'bank.accountNumber'];
  const OPTIONAL = ['income', 'expenses', 'creditConsent'];

  const completeness = useMemo(() => {
    const reqFilled = REQUIRED.filter((k) => isFilled(get(uDoc, k))).length;
    const optFilled = OPTIONAL.filter((k) => isFilled(get(uDoc, k))).length;
    const percent = Math.round((reqFilled / REQUIRED.length) * 100);
    return { percent, reqFilled, reqTotal: REQUIRED.length, optFilled };
  }, [uDoc]);

  const counts = apps.reduce(
    (acc, a) => {
      const s = (a.status || 'pending').toLowerCase();
      acc.total += 1;
      if (s === 'pending') acc.pending += 1;
      if (s === 'active') acc.active += 1;
      if (s === 'approved') acc.approved += 1;
      if (s === 'rejected') acc.rejected += 1;
      if (s === 'cancelled') acc.cancelled += 1;
      return acc;
    },
    { total: 0, pending: 0, active: 0, approved: 0, rejected: 0, cancelled: 0 }
  );

  const refSummary = useMemo(() => {
    const total = refs.length;
    let active = 0;
    let redemptions = 0;
    refs.forEach((r) => {
      if (r.active) active += 1;
      redemptions += Number(r.usedCount || 0);
    });
    return { total, active, redemptions };
  }, [refs]);

  const displayName =
    uDoc?.fullName || auth.currentUser?.email?.split('@')[0] || 'User';

  const initials = (name) =>
    name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0] || '')
      .join('')
      .toUpperCase();

  const fmtZAR = (n) =>
    new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR',
      maximumFractionDigits: 0,
    }).format(Number.isFinite(n) ? n : 0);

  if (loading) {
    return (
      <DashboardLayout>
        <div>Loading…</div>
      </DashboardLayout>
    );
  }

  const card = {
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 8px 30px rgba(16,24,40,0.08)',
    padding: 24,
    marginBottom: 20,
  };
  const row = { display: 'grid', gridTemplateColumns: '1fr 380px', gap: 20 };
  const pill = {
    display: 'inline-block',
    padding: '6px 10px',
    background: '#eef2ff',
    color: '#3b5bff',
    borderRadius: 999,
    fontSize: 13,
    marginRight: 8,
  };
  const primaryBtn = {
    height: 44,
    borderRadius: 10,
    background: '#4A7CFF',
    color: '#fff',
    border: 'none',
    fontWeight: 600,
    padding: '0 16px',
    cursor: 'pointer',
  };
  const ghostBtn = {
    height: 44,
    borderRadius: 10,
    background: '#f6f8ff',
    color: '#334155',
    border: '1px solid #e6eaf9',
    fontWeight: 600,
    padding: '0 16px',
    textAlign: 'left',
  };

  return (
    <DashboardLayout>
      <h2 style={{ margin: '4px 0 16px' }}>Overview</h2>

      <div style={row}>
        {/* Welcome */}
        <div style={card}>
          <div style={{ fontSize: 12, letterSpacing: 1, color: '#475569', marginBottom: 8 }}>
            WELCOME
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700 }}>Hi, {displayName}!</div>
              <div style={{ color: '#475569', marginTop: 6 }}>
                One profile for borrowing and lending. Manage your activity from a single place.
              </div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: '50%',
                  background: '#eef2ff',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#3b5bff',
                  fontWeight: 700,
                }}
                title={displayName}
              >
                {initials(displayName)}
              </div>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div style={card}>
          <div style={{ fontSize: 12, letterSpacing: 1, color: '#475569', marginBottom: 8 }}>
            QUICK ACTIONS
          </div>
          <div style={{ display: 'grid', gap: 12 }}>
            <button style={ghostBtn} onClick={() => {
              const step = nextOnboardingStep(uDoc || {});
              nav(stepPath(step));
            }}>
              Update profile
            </button>
            <button style={ghostBtn} onClick={() => nav('/new-loan')}>Apply for a loan</button>
            <button style={ghostBtn} onClick={() => nav('/loans')}>View my loans</button>
          </div>
        </div>
      </div>

      {/* Profile completeness */}
      <div style={card}>
        <div style={{ fontSize: 12, letterSpacing: 1, color: '#475569', marginBottom: 8 }}>
          PROFILE COMPLETENESS
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ fontSize: 22, fontWeight: 700 }}>{completeness.percent}%</div>
          <div style={{ color: '#475569' }}>
            {completeness.reqFilled}/{completeness.reqTotal} required · {completeness.optFilled}/{OPTIONAL.length} optional
          </div>
        </div>
        <div
          style={{
            height: 8,
            background: '#eef2ff',
            borderRadius: 999,
            margin: '14px 0 16px',
            position: 'relative',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              height: '100%',
              width: `${completeness.percent}%`,
              background: '#4A7CFF',
              borderRadius: 999,
              transition: 'width 300ms',
            }}
          />
        </div>
        <div style={{ marginBottom: 16 }}>
          <span style={pill}>Bank account</span>
          <span style={pill}>Expenses</span>
          <span style={pill}>Credit consent</span>
        </div>
<button
  type="button"
  style={primaryBtn} // or whatever style you already use
  onClick={() => {
    // uDoc is your loaded Firestore user doc on this page.
    const step = nextOnboardingStep(uDoc || {});
    nav(stepPath(step));
  }}
>
  Continue onboarding
</button>
      </div>

      {/* Referrals + Wallet */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div style={card}>
          <div style={{ fontSize: 12, letterSpacing: 1, color: '#475569', marginBottom: 8 }}>
            REFERRALS
          </div>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 12, color: '#8891aa' }}>Codes</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{refSummary.total}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#8891aa' }}>Active</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{refSummary.active}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: '#8891aa' }}>Redemptions</div>
              <div style={{ fontSize: 20, fontWeight: 800 }}>{refSummary.redemptions}</div>
            </div>
          </div>
        </div>

        <div style={card}>
          <div style={{ fontSize: 12, letterSpacing: 1, color: '#475569', marginBottom: 8 }}>
            WALLET
          </div>
          <div style={{ fontSize: 28, fontWeight: 800 }}>{fmtZAR(wallet)}</div>
          <div style={{ color: '#475569', marginTop: 6 }}>
            Manage your balance in the Wallet tab.
          </div>
        </div>
      </div>

      {/* Applications snapshot */}
      <div style={card}>
        <div style={{ fontSize: 12, letterSpacing: 1, color: '#475569', marginBottom: 8 }}>
          APPLICATIONS
        </div>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <div style={{ fontSize: 22, fontWeight: 800 }}>{counts.total}</div>
          <span style={pill}>Pending {counts.pending}</span>
          <span style={pill}>Active {counts.active}</span>
          <span style={pill}>Approved {counts.approved}</span>
          <span style={pill}>Rejected {counts.rejected}</span>
          <span style={pill}>Cancelled {counts.cancelled}</span>
        </div>
      </div>
    </DashboardLayout>
  );
}
