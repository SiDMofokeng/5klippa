// 5klippa-web/src/onboarding/OnboardingLayout.jsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { nextOnboardingStep, stepPath } from '../utils/onboarding';

const STEPS = [
  { key: 'account',   label: 'Account',   path: '' },
  { key: 'identity',  label: 'Identity',  path: 'identity' },
  { key: 'contact',   label: 'Contact',   path: 'contact' },
  { key: 'financial', label: 'Financial', path: 'financial' },
  { key: 'roles',     label: 'Consent',   path: 'roles' },
  { key: 'done',      label: 'Finish',    path: 'done' },
];

function pathToStep(pathname) {
  const seg = pathname.split('/')[2] || '';
  if (!seg) return 'account';
  const match = STEPS.find(s => s.path === seg);
  return match ? match.key : 'account';
}

export default function OnboardingLayout() {
  const nav = useNavigate();
  const { pathname } = useLocation();

  const [user, setUser] = useState(null);
  const [uDoc, setUDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const routedRef = useRef(false);

  // Auth + user doc
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {

      if (!u) {
        const atAccount =
          pathname === '/onboarding' || pathname === '/onboarding/account';
        if (!atAccount) {
          setUser(null); setUDoc(null); setLoading(false);
          nav('/login', { replace: true });
          return;
        }
        // allow public account step (registration)
        setUser(null); setUDoc(null); setLoading(false);
        return;
      }
      setUser(u);
      const snap = await getDoc(doc(db, 'users', u.uid));
      setUDoc(snap.exists() ? snap.data() : {});
      setLoading(false);
    });
    return () => unsub();
  }, [nav]);

// --- KEEP the imports and other code above as-is ---

// Guard: keep user on allowed step only; reconcile stored currentStep with inferred step from data
useEffect(() => {
  if (loading || !user) return;

  // 1) infer from actual saved data
  const inferred = (function infer() {
    // local copy of nextOnboardingStep logic without importing again
    const STEP_ORDER = ['identity', 'contact', 'financial', 'roles', 'done'];
    const has = (obj, path) => {
      try {
        const v = path.split('.').reduce((a, k) => (a == null ? undefined : a[k]), obj);
        return v !== undefined && v !== null && String(v).trim().length > 0;
      } catch { return false; }
    };

    const d = uDoc || {};
    const ob = d.onboarding || {};

    if (typeof ob.currentStep === 'string' && STEP_ORDER.includes(ob.currentStep)) {
      // we'll still reconcile below, but this lets us reuse logic
    }

    if (!(has(d, 'fullName') && has(d, 'idNumber'))) return 'identity';
    if (!(has(d, 'phone') && has(d, 'addressLine1'))) return 'contact';
    if (!has(d, 'bank.accountNumber')) return 'financial';
    if (d.creditConsent !== true) return 'roles';
    return 'done';
  })();

  // 2) read stored currentStep (may be stale/too-advanced)
  const stored = uDoc?.onboarding?.currentStep;

  // 3) choose the earlier of (stored, inferred)
  const ORDER = ['identity', 'contact', 'financial', 'roles', 'done'];
  const rank = (s) => ORDER.indexOf(s);
  let current;
  if (typeof stored === 'string' && ORDER.includes(stored)) {
    current = rank(inferred) < rank(stored) ? inferred : stored;
  } else {
    current = inferred;
  }

  // 4) if everything is done, bounce to dashboard
  if (current === 'done') {
    if (!routedRef.current) {
      routedRef.current = true;
      nav('/onboarding/done', { replace: true });
      setTimeout(() => (routedRef.current = false), 0);
    }
    return;
  }

  // 5) enforce route
  const seg = pathname.split('/')[2] || '';                    // path segment after /onboarding/
  const here = seg === '' ? 'account' : seg;                   // treat /onboarding as 'account'
  const allowed = here === 'account' || here === current;      // only the current step (or account shell)

  const targetPath =
    current === 'identity'  ? 'identity'  :
    current === 'contact'   ? 'contact'   :
    current === 'financial' ? 'financial' :
    current === 'roles'     ? 'roles'     :
    ''; // account

  const currentPath = pathname.startsWith('/onboarding') ? pathname.replace('/onboarding/', '') : '';
  const want = allowed ? currentPath : targetPath;

  if (currentPath !== want) {
    if (!routedRef.current) {
      routedRef.current = true;
      nav(`/onboarding/${want}`, { replace: true });
      setTimeout(() => (routedRef.current = false), 0);
    }
  }
}, [loading, user, uDoc, pathname, nav]);


  const steps = useMemo(
    () => [
      { key: 'account', label: 'Account' },
      { key: 'identity', label: 'Identity' },
      { key: 'contact', label: 'Contact' },
      { key: 'financial', label: 'Financial' },
      { key: 'roles', label: 'Consent' },
    ],
    []
  );

  const activeKey = pathname.startsWith('/onboarding/')
    ? (pathname.split('/')[2] || 'account')
    : 'account';

  // Layout styles
  const shell = { minHeight: '100vh', background: '#f7f9ff' };

  // LEFT (fixed)
  const left = {
    position: 'fixed', left: 0, top: 0, bottom: 0, width: 260,
    background: '#4A7CFF', color: '#fff', padding: '28px 20px',
    display: 'flex', flexDirection: 'column',
  };
  const brand = { fontWeight: 700, fontSize: 22, marginBottom: 6 };
  const tag = { opacity: 0.92, fontSize: 14, marginBottom: 20 };
  const stepItem = (active) => ({
    padding: '10px 12px', borderRadius: 8, marginBottom: 6, cursor: 'pointer',
    userSelect: 'none', background: active ? 'rgba(255,255,255,0.16)' : 'transparent', color: '#fff',
  });
  const leftFooter = { marginTop: 'auto', paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.22)' };
  const logoutBtn = {
    width: '100%', textAlign: 'left', padding: '10px 12px', borderRadius: 8,
    background: 'rgba(255,255,255,0.10)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer',
  };

  // RIGHT (scrolls)
  const right = { marginLeft: 260, height: '100vh', overflowY: 'auto' };
  const inner = { maxWidth: 1100, margin: '0 auto', padding: '24px 28px 32px' };

  const header = { display: 'flex', alignItems: 'center', justifyContent: 'flex-end', marginBottom: 12 };
  const dashBtn = {
    height: 36, borderRadius: 10, background: '#f6f8ff', color: '#334155',
    border: '1px solid #e6eaf9', fontWeight: 600, padding: '0 12px', cursor: 'pointer', marginRight: 12,
  };
  const avatar = {
    width: 36, height: 36, borderRadius: '50%', background: '#eef2ff', color: '#3b5bff',
    display: 'grid', placeItems: 'center', fontWeight: 700,
  };
  const initials = (fullName, email) => {
    const src = (fullName && fullName.trim()) || (email || '').split('@')[0];
    if (!src) return 'U';
    const parts = src.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return src.slice(0, 2).toUpperCase();
  };

  if (loading) {
    return <div style={{ ...shell, display: 'grid', placeItems: 'center' }}>Loading…</div>;
  }

  return (
    <div style={shell}>
      <aside style={left}>
        <div style={brand}>5Klippa</div>
        <div style={tag}>One profile. Borrow & lend.</div>

        {steps.map((s) => (
          <div
            key={s.key}
            style={stepItem(activeKey === s.key)}
            onClick={() => nav(s.key === 'account' ? '/onboarding' : `/onboarding/${s.key}`)}
          >
            {s.label}
          </div>
        ))}

        <div style={leftFooter}>
          <button
            type="button"
            style={logoutBtn}
            onClick={async () => { await signOut(auth); nav('/login', { replace: true }); }}
          >
            Logout
          </button>
        </div>
      </aside>

      <main style={right}>
        <div style={inner}>
          <div style={header}>
            <button type="button" style={dashBtn} onClick={() => nav('/dashboard')}>Dashboard</button>
            {user && <div style={avatar} title={user.email || ''}>{initials(uDoc?.fullName, user.email)}</div>}
          </div>

          <div style={{ background: '#fff', borderRadius: 16, boxShadow: '0 8px 30px rgba(16,24,40,0.08)', padding: 24 }}>
            <Outlet />
          </div>
        </div>
      </main>
    </div>
  );
}
