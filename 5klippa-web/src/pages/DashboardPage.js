// 5klippa-web/src/pages/DashboardPage.js

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function DashboardPage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading]   = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const snap = await getDoc(doc(db, 'users', user.uid));
        if (snap.exists()) setUserData(snap.data());
      } else {
        navigate('/login', { replace: true });
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login', { replace: true });
  };

  if (loading) return <p>Loading…</p>;

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: '1rem' }}>
      <h2>Welcome, {userData?.email}!</h2>
      <p>Role: {userData?.role}</p>
      <button
        onClick={handleLogout}
        style={{
          padding: '8px 16px',
          background: '#ccc',
          border: 'none',
          borderRadius: '4px',
        }}
      >
        Log Out
      </button>
    </div>
  );
}
