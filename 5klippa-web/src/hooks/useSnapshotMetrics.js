// 5klippa-web/src/hooks/useSnapshotMetrics.js
import { useEffect, useMemo, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { collection, doc, onSnapshot, query, where } from 'firebase/firestore';

export function useSnapshotMetrics() {
  const [uid, setUid] = useState(null);
  const [apps, setApps] = useState([]);
  const [wallet, setWallet] = useState(null);
  const [loading, setLoading] = useState(true);

  // get uid
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) { setUid(null); setLoading(false); return; }
      setUid(u.uid);
    });
    return () => unsub();
  }, []);

  // subscribe to applications for this user
  useEffect(() => {
    if (!uid) return;
    const q = query(collection(db, 'applications'), where('borrowerId', '==', uid));
    const unsub = onSnapshot(q, (snap) => {
      const rows = [];
      snap.forEach((d) => rows.push({ id: d.id, ...d.data() }));
      setApps(rows);
      setLoading(false);
    });
    return () => unsub();
  }, [uid]);

  // subscribe to wallet doc
  useEffect(() => {
    if (!uid) return;
    const unsub = onSnapshot(doc(db, 'wallets', uid), (snap) => {
      setWallet(snap.exists() ? snap.data() : null);
    });
    return () => unsub();
  }, [uid]);

  const metrics = useMemo(() => {
    const activeStatuses = new Set(['pending', 'active']);
    const active = apps.filter(a => activeStatuses.has((a.status || 'pending').toLowerCase()));

    const activeCount = active.length;

    const outstanding = active.reduce((sum, a) => {
      const val =
        typeof a.outstandingPrincipal === 'number'
          ? a.outstandingPrincipal
          : typeof a.amount === 'number'
            ? a.amount
            : 0;
      return sum + val;
    }, 0);

    // next repayment (choose earliest future nextDueDate with amount)
    let next = null;
    for (const a of active) {
      const amt = a.nextDueAmount;
      const dt = a.nextDueDate;
      if (!amt || !dt || !dt.toDate) continue;
      const when = dt.toDate();
      if (!next || when < next.when) {
        next = { amount: Number(amt) || 0, when };
      }
    }

    const walletBalance = Number(wallet?.balance || 0);

    return { activeCount, outstanding, next, walletBalance };
  }, [apps, wallet]);

  return { loading, metrics };
}
