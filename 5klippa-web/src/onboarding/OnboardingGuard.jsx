// src/onboarding/OnboardingGuard.jsx
import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

// Step ↔ Path maps
const STEP_TO_PATH = {
  account: '',
  identity: 'identity',
  contact: 'contact',
  financial: 'financial',
  roles: 'roles',
  done: 'done',
};
const PATH_TO_STEP = Object.fromEntries(
  Object.entries(STEP_TO_PATH).map(([k, v]) => [v || undefined, k])
);

function pathToStep(pathname) {
  const seg = pathname.split('/')[2]; // undefined or 'identity'|'contact'...
  return PATH_TO_STEP[seg] || 'account';
}

export default function OnboardingGuard({ children }) {
  const nav = useNavigate();
  const { pathname } = useLocation();

  const [uid, setUid] = useState(null);
  const [uDoc, setUDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const navLock = useRef(false); // prevent rapid double-navigate

  // Single auth listener + user doc fetch
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        nav('/login', { replace: true });
        return;
      }
      setUid(u.uid);
      const snap = await getDoc(doc(db, 'users', u.uid));
      setUDoc(snap.exists() ? snap.data() : {});
      setLoading(false);
    });
    return () => unsub();
  }, [nav]);

  // Routing guard
  useEffect(() => {
    if (loading || !uid) return;

    const currentStep = uDoc?.onboarding?.currentStep || 'account';
    const completed = new Set(uDoc?.onboarding?.completed || []);

    if (currentStep === 'complete') {
      if (!navLock.current) {
        navLock.current = true;
        nav('/dashboard', { replace: true });
        setTimeout(() => (navLock.current = false), 0);
      }
      return;
    }

    const here = pathToStep(pathname);
    const allowed = completed.has(here) || here === currentStep;
    const targetStep = allowed ? here : currentStep;
    const currentPath = pathname.startsWith('/onboarding')
      ? pathname.replace('/onboarding/', '')
      : '';
    const targetPath = STEP_TO_PATH[targetStep] || '';

    // Only navigate if path differs
    if (currentPath !== targetPath && !navLock.current) {
      navLock.current = true;
      nav(`/onboarding/${targetPath}`, { replace: true });
      setTimeout(() => (navLock.current = false), 0);
    }
  }, [loading, uid, uDoc, pathname, nav]);

  if (loading) return <div>Loading…</div>;
  return children;
}
