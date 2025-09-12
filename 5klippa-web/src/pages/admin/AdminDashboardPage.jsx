// src/admin/AdminOverviewPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { db } from '../../firebaseConfig';
import {
  collection, query, orderBy, limit, getDocs, getCountFromServer
} from 'firebase/firestore';

// ----------------- tiny chart helpers -----------------
function UsersSparkline({ series }) {
  const N = series.length;
  const W = 520;
  const H = 140;
  const max = Math.max(1, ...series);
  const stepX = W / (N - 1);

  const points = series
    .map((y, i) => {
      const px = i * stepX;
      const py = H - (y / max) * (H - 16) - 8;
      return `${px},${py}`;
    })
    .join(' ');

  const area = `${points} ${W},${H} 0,${H}`;
  const lastY = series[N - 1];

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H}>
      <defs>
        <linearGradient id="uFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopOpacity="0.22" stopColor="#4A7CFF" />
          <stop offset="100%" stopOpacity="0.02" stopColor="#4A7CFF" />
        </linearGradient>
      </defs>
      <rect x="0" y="0" width={W} height={H} fill="white" rx="10" />
      <polyline fill="url(#uFill)" stroke="none" points={area} />
      <polyline fill="none" stroke="#4A7CFF" strokeWidth="2.5" points={points} />
      <circle
        cx={(N - 1) * stepX}
        cy={H - (lastY / max) * (H - 16) - 8}
        r="3.5"
        fill="#4A7CFF"
      />
    </svg>
  );
}

function ApplicationsStatusBar({ counts }) {
  const colors = {
    APPROVED: '#12B76A',
    PENDING:  '#4A7CFF',
    CANCELLED:'#F97066',
    REJECTED: '#F79009',
    OTHER:    '#98A2B3',
  };
  const entries = Object.entries(counts).filter(([, v]) => v > 0);
  const total = entries.reduce((s, [, v]) => s + v, 0) || 1;

  return (
    <div>
      <div style={{
        display:'flex', height:22, borderRadius:999, overflow:'hidden',
        border:'1px solid #E4E7EC', background:'#F2F4F7', marginBottom:10
      }}>
        {entries.map(([k, v]) => (
          <div key={k}
            style={{ width:`${(v/total)*100}%`, background:colors[k] || colors.OTHER }}
            title={`${k} – ${v}`} />
        ))}
      </div>

      <div style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
        {entries.map(([k, v]) => (
          <div key={k} style={{ display:'inline-flex', alignItems:'center', gap:8, fontSize:13 }}>
            <span style={{ width:10, height:10, borderRadius:3, background:(colors[k]||colors.OTHER) }}/>
            <span style={{ color:'#475467' }}>{k}</span>
            <span style={{ color:'#98A2B3' }}>· {v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ----------------- page -----------------
export default function AdminOverviewPage() {
  const [counts, setCounts] = useState({ users: 0, apps: 0, refs: 0, wallets: 0 });
  const [recentApps, setRecentApps] = useState([]);
  const [recentUsers, setRecentUsers] = useState([]);
  const [err, setErr] = useState('');

  // layout
  const page = { maxWidth: 1200, margin:'0 auto', padding:'24px 16px' };
  const h1 = { margin:'0 0 6px', fontSize:22, fontWeight:700 };
  const sub = { margin:'0 0 18px', color:'#667085' };

  const gridTwo = { display:'grid', gridTemplateColumns:'1fr 1fr', gap:24, marginBottom:16 };
  const card = {
    background:'#fff', borderRadius:16, boxShadow:'0 8px 30px rgba(16,24,40,0.08)',
    padding:20, minHeight:210
  };
  const header = { margin:'0 0 6px', fontSize:16, fontWeight:700 };

  const kpiGrid = { display:'grid', gridTemplateColumns:'repeat(4, 1fr)', gap:16, marginTop:8 };
  const kpiCard = {
    ...card, padding:'16px 18px', minHeight:88, boxShadow:'0 6px 18px rgba(16,24,40,0.06)',
    position:'relative'
  };
  const kpiTitle = { fontSize:12, color:'#667085', margin:0 };
  const kpiValue = { fontSize:26, fontWeight:800, margin:0 };
  const viewLink = {
    position:'absolute', right:12, bottom:12, fontSize:12,
    padding:'6px 10px', borderRadius:8, border:'1px solid #E4E7EC',
    color:'#344054', textDecoration:'none', background:'#F9FAFB'
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      setErr('');
      try {
        const [u, a, r, w] = await Promise.all([
          getCountFromServer(query(collection(db, 'users'))),
          getCountFromServer(query(collection(db, 'applications'))),
          getCountFromServer(query(collection(db, 'referrals'))),
          getCountFromServer(query(collection(db, 'wallets'))),
        ]);
        if (!alive) return;
        setCounts({
          users: u.data().count || 0,
          apps: a.data().count || 0,
          refs: r.data().count || 0,
          wallets: w.data().count || 0
        });

        const [appsSnap, usersSnap] = await Promise.all([
          getDocs(query(collection(db, 'applications'), orderBy('createdAt','desc'), limit(60))),
          getDocs(query(collection(db, 'users'),        orderBy('createdAt','desc'), limit(120)))
        ]);
        if (!alive) return;
        setRecentApps(appsSnap.docs.map(d => ({ id:d.id, ...d.data() })));
        setRecentUsers(usersSnap.docs.map(d => ({ id:d.id, ...d.data() })));
      } catch (e) {
        if (!alive) return;
        setErr(e.message || 'Failed to load overview');
      }
    })();
    return () => { alive = false; };
  }, []);

  const appStatusCounts = useMemo(() => {
    const acc = { APPROVED:0, PENDING:0, CANCELLED:0, REJECTED:0, OTHER:0 };
    for (const a of recentApps) {
      const s = String(a.status || '').toUpperCase();
      if (acc[s] === undefined) acc.OTHER += 1;
      else acc[s] += 1;
    }
    return acc;
  }, [recentApps]);

  const users14 = useMemo(() => {
    const days = 14;
    const now = new Date();
    const keys = [...Array(days)].map((_, i) => {
      const d = new Date(now);
      d.setDate(now.getDate() - (days - 1 - i));
      return d.toISOString().slice(0,10);
    });
    const idx = Object.fromEntries(keys.map((k,i)=>[k,i]));
    const series = new Array(days).fill(0);

    for (const u of recentUsers) {
      const d = u.createdAt?.toDate ? u.createdAt.toDate() : (u.createdAt ? new Date(u.createdAt) : null);
      if (!d) continue;
      const k = d.toISOString().slice(0,10);
      const i = idx[k];
      if (i !== undefined) series[i] += 1;
    }
    return series;
  }, [recentUsers]);

  return (
    <main className="admin-main">
      <div style={page}>
        <h1 style={h1}>Overview</h1>
        <p style={sub}>Key metrics and recent activity (compact view).</p>
        {err && <div style={{color:'#b00020', fontSize:13, marginBottom:12}}>{err}</div>}

        <div style={gridTwo}>
          <div style={card}>
            <h3 style={header}>Applications by status</h3>
            <ApplicationsStatusBar counts={appStatusCounts} />
            <p style={{margin:'10px 0 0', fontSize:12, color:'#98A2B3'}}>
              Last {recentApps.length} applications.
            </p>
          </div>

          <div style={card}>
            <h3 style={header}>New users (last 14 days)</h3>
            <UsersSparkline series={users14} />
          </div>
        </div>

        {/* KPI row with "View" links */}
        <div style={kpiGrid}>
          <div style={kpiCard}>
            <p style={kpiTitle}>Users</p>
            <p style={kpiValue}>{counts.users}</p>
            <Link to="/admin/users" style={viewLink}>View</Link>
          </div>

          <div style={kpiCard}>
            <p style={kpiTitle}>Applications</p>
            <p style={kpiValue}>{counts.apps}</p>
            <Link to="/admin/applications" style={viewLink}>View</Link>
          </div>

          <div style={kpiCard}>
            <p style={kpiTitle}>Referral codes</p>
            <p style={kpiValue}>{counts.refs}</p>
            <Link to="/admin/referrals" style={viewLink}>View</Link>
          </div>

          <div style={kpiCard}>
            <p style={kpiTitle}>Wallets</p>
            <p style={kpiValue}>{counts.wallets}</p>
            <Link to="/admin/wallets" style={viewLink}>View</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
