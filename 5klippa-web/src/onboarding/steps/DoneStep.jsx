// 5klippa-web/src/onboarding/steps/DoneStep.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebaseConfig';
import { doc, setDoc, serverTimestamp, arrayUnion } from 'firebase/firestore';

export default function DoneStep() {
  const nav = useNavigate();
  const [busy, setBusy] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged(async (u) => {
      if (!u) { nav('/login', { replace: true }); return; }
      try {
        await setDoc(doc(db, 'users', u.uid), {
          updatedAt: serverTimestamp(),
          onboarding: {
            currentStep: 'complete',
            completed: arrayUnion('done'),
          }
        }, { merge: true });
      } finally {
        setBusy(false);
      }
    });
    return () => unsub();
  }, [nav]);

  const card = { maxWidth: 520, margin: '0 auto', textAlign: 'center' };
  const primary = { marginTop: 20, width: '100%', height: 46, borderRadius: 10, background: '#4A7CFF', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer' };

  return (
    <div style={card}>
      <h2 style={{ margin: 0 }}>All set!</h2>
      <p style={{ color: '#666', marginTop: 8 }}>
        {busy ? 'Finalising your profile…' : 'Your profile is complete.'}
      </p>
      {!busy && (
        <button style={primary} onClick={() => nav('/dashboard', { replace: true })}>
          Go to Dashboard
        </button>
      )}
    </div>
  );
}
