// src/hooks/useUserProfile.js
import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

export function useUserProfile() {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stopAuth = onAuthStateChanged(auth, (u) => {
      setUser(u);
      if (!u) {
        setProfile(null);
        setLoading(false);
        return;
      }
      const stopDoc = onSnapshot(doc(db, 'users', u.uid), (snap) => {
        setProfile(snap.data() || null);
        setLoading(false);
      });
      return () => stopDoc();
    });
    return () => stopAuth();
  }, []);

  return { user, profile, loading };
}
