// 5klippa-web/src/onboarding/steps/AccountStep.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../../firebaseConfig';
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  runTransaction,
  serverTimestamp,
  arrayUnion,
} from 'firebase/firestore';
import { createUserWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth';

export default function AccountStep() {
  const nav = useNavigate();

  const [authed, setAuthed] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);

  // register form state
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [refCode, setRefCode] = useState('');
  const [working, setWorking] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    const off = onAuthStateChanged(auth, u => {
      setAuthed(!!u);
      setCheckingAuth(false);
    });
    return () => off();
  }, []);

  // ---------- SIGNED-IN: one-click continue ----------
  async function continueSignedIn() {
    if (!auth.currentUser) return;
    setErr('');
    setWorking(true);
    try {
      const ref = doc(db, 'users', auth.currentUser.uid);
      const snap = await getDoc(ref);

      if (!snap.exists()) {
        // Don’t try to create (rules likely forbid it without referral fields)
        setErr('Your profile isn’t created yet. Please register with a referral code first.');
        return;
      }

      await updateDoc(ref, {
        updatedAt: serverTimestamp(),
        onboarding: {
          currentStep: 'identity',
          completed: arrayUnion('account'),
        },
      });

      nav('/onboarding/identity', { replace: true });
    } catch (e) {
      console.error(e);
      setErr(e.message || 'Failed to continue');
    } finally {
      setWorking(false);
    }
  }

  async function validateReferralById(db, raw) {
    const code = (raw || '').trim();
    if (!code) return { ok: false, reason: 'Enter a referral code.' };

    // 1) Try: code is the document ID
    const ref = doc(db, 'referrals', code);
    const snap = await getDoc(ref);
    if (snap.exists()) {
      const d = snap.data();
      if (d.active === false) return { ok: false, reason: 'Referral code is inactive.' };
      const max = Number.isFinite(d.maxUses) ? d.maxUses : 1;
      const used = Number(d.usedCount || 0);
      if (used >= max) return { ok: false, reason: 'This referral code has been fully used.' };
      return { ok: true, ref, data: d };
    }

    // (Optional backward-compat) Fall back to a field-based lookup if you ever stored `code` as a field:
    // const q = query(collection(db,'referrals'), where('code','==', code), limit(1));
    // const qs = await getDocs(q);
    // if (!qs.empty) { /* same checks as above using qs.docs[0] */ }

    return { ok: false, reason: 'Invalid referral code.' };
  }


  async function onRegister(e) {
    if (e) e.preventDefault();
    setErr('');
    if (!email.trim() || !pw || !refCode.trim()) {
      setErr('Email, password and referral code are required.');
      return;
    }
    setWorking(true);
    try {
      // a) validate referral by doc ID
      const chk = await validateReferralById(db, refCode);
      if (!chk.ok) { setErr(chk.reason); return; }

      // b) create auth user
      const cred = await createUserWithEmailAndPassword(auth, email.trim(), pw);

      // c) atomically reserve a use
      await runTransaction(db, async (tx) => {
        const s = await tx.get(chk.ref);
        if (!s.exists()) throw new Error('Referral not found.');
        const d = s.data();
        if (d.active === false) throw new Error('Referral inactive.');
        const max = Number.isFinite(d.maxUses) ? d.maxUses : 1;
        const used = Number(d.usedCount || 0);
        if (used >= max) throw new Error('Referral already fully used.');

        tx.update(chk.ref, {
          usedCount: used + 1,
          lastUsedAt: serverTimestamp(),
        });
        const rid = `${chk.ref.id}_${cred.user.uid}`;
        tx.set(doc(db, 'referralRedemptions', rid), {
          code: chk.ref.id,
          userUid: cred.user.uid,
          ownerUid: d.ownerUid || null,
          createdAt: serverTimestamp(),
        });
      });

      // d) write user profile + advance onboarding
      await setDoc(doc(db, 'users', cred.user.uid), {
        email: email.trim(),
        referredBy: chk.data.ownerUid || null,
        referralCodeUsed: chk.ref.id,
        onboarding: { currentStep: 'identity', completed: arrayUnion('account') },
        updatedAt: serverTimestamp(),
      }, { merge: true });

      // e) continue
      nav('/onboarding/identity', { replace: true });
    } catch (e) {
      setErr(e.message || 'Registration failed');
    } finally {
      setWorking(false);
    }
  }

  // ----- UI -----
  const wrap = { maxWidth: 520, margin: '0 auto' };
  const card = { background:'#fff', borderRadius:16, boxShadow:'0 8px 30px rgba(16,24,40,0.08)', padding:24 };
  const h2 = { margin:0, fontSize:22, fontWeight:700 };
  const label = { display:'block', fontSize:13, margin:'10px 0 6px' };
  const input = { width:'100%', height:44, borderRadius:8, border:'1px solid #d9dbe3', padding:'0 12px' };
  const primary = { marginTop:16, width:'100%', height:46, borderRadius:10, background:'#4A7CFF', color:'#fff', border:'none', fontWeight:600, cursor:'pointer' };
  const error = { marginTop:10, color:'#b00020', fontSize:13 };

  if (checkingAuth) return <div>Loading…</div>;

  // NOT LOGGED IN → registration form
  if (!authed) {
    return (
      <div style={wrap}>
        <div style={card}>
          <h2 style={h2}>Create your account</h2>
          <p>Enter your details and referral code to start onboarding.</p>
          <form onSubmit={onRegister}>
            <label style={label}>Email</label>
            <input style={input} type="email" value={email} onChange={e=>setEmail(e.target.value)} required />

            <label style={label}>Password</label>
            <input style={input} type="password" value={pw} onChange={e=>setPw(e.target.value)} required />

            <label style={label}>Referral code</label>
            <input style={input} value={refCode} onChange={e=>setRefCode(e.target.value)} required />

            {err && <div style={error}>{err}</div>}
            <button type="submit" disabled={working} style={primary}>
              {working ? 'Working…' : 'Register & Continue'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // LOGGED IN → one button to proceed
  return (
    <div style={wrap}>
      <div style={card}>
        <h2 style={h2}>Account</h2>
        <p>You’re signed in. We’ll mark this step complete and continue.</p>
        {err && <div style={error}>{err}</div>}
        <button type="button" onClick={continueSignedIn} disabled={working} style={primary}>
          {working ? 'Saving…' : 'Continue'}
        </button>
      </div>
    </div>
  );
}
