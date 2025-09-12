// 5klippa-web/src/pages/admin/AdminShell.jsx
import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth, db } from '../../firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import AdminLayout from '../../components/AdminLayout';

export default function AdminShell() {
  const nav = useNavigate();
  const [checking, setChecking] = useState(true);
  const [ok, setOk] = useState(false);

const left  = { width: 260 /* … */ };     // sidebar width
const right = { marginLeft: 260 /* … */ };// content offset = same number


  useEffect(() => {
    const off = onAuthStateChanged(auth, async (u) => {
      if (!u) { setOk(false); setChecking(false); nav('/admin/login', { replace: true }); return; }
      const snap = await getDoc(doc(db, 'users', u.uid));
      const isAdmin = snap.exists() && snap.data().isAdmin === true;
      if (!isAdmin) {
        await signOut(auth);
        setOk(false);
        setChecking(false);
        nav('/admin/login?err=not_admin', { replace: true });
        return;
      }
      setOk(true);
      setChecking(false);
    });
    return () => off();
  }, [nav]);

  if (checking) {
    return <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>Checking access…</div>;
  }

  if (!ok) return null;

  return (
    <AdminLayout>
      <Outlet />
    </AdminLayout>
  );
}
