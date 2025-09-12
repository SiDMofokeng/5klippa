// src/pages/DashboardOverview.jsx
import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useUserProfile } from '../hooks/useUserProfile';

export default function DashboardOverview() {
  const nav = useNavigate();
  const { user, profile, loading } = useUserProfile();

  // Kick to login if not signed in
  React.useEffect(() => {
    if (!loading && !user) nav('/login', { replace: true });
  }, [loading, user, nav]);

  if (loading) return <Skeleton />;

  // --- profile completeness -----------------------------------------------
  // We accept a few shapes to be forgiving with existing data
  const has = (v) => Boolean(v && String(v).trim().length);

  const contactAddress =
    profile?.address ||
    profile?.contactAddress ||
    [
      profile?.addressLine,
      profile?.city,
      profile?.country,
    ].filter(Boolean).join(', ');

  const checks = {
    fullName: has(profile?.fullName),
    idNumber: has(profile?.idNumber),
    phone: has(profile?.phone),
    address: has(contactAddress),
    bankAccount: has(profile?.bankAccount),
    employmentStatus: has(profile?.employmentStatus),
    monthlyIncome: has(profile?.monthlyIncome),
    expenses: has(profile?.expenses),
    consentCredit: profile?.consentCredit === true,
  };

  const REQUIRED_KEYS = ['fullName', 'idNumber', 'phone', 'address'];
  const OPTIONAL_KEYS = ['bankAccount', 'employmentStatus', 'monthlyIncome', 'expenses', 'consentCredit'];

  const reqDone = REQUIRED_KEYS.filter((k) => checks[k]).length;
  const optDone = OPTIONAL_KEYS.filter((k) => checks[k]).length;
  const completeness = Math.round(((reqDone + optDone * 0.5) / (REQUIRED_KEYS.length + OPTIONAL_KEYS.length * 0.5)) * 100);

  // Next action for the user
  const nextStepHref = completeness < 100 ? '/onboarding' : '/new-loan';

  return (
    <div style={stack}>
      <Card>
        <div style={rowBetween}>
          <div>
            <div style={eyebrow}>Welcome</div>
            <h2 style={h2}>
              {profile?.fullName ? `Hi, ${profile.fullName}!` : (user?.email || 'Hi there!')}
            </h2>
            <p style={muted}>
              One profile for borrowing and lending. Manage your activity from a single place.
            </p>
          </div>
          <Avatar name={profile?.fullName || user?.email} />
        </div>
      </Card>

      <Card>
        <div style={rowBetween}>
          <div>
            <div style={eyebrow}>Profile completeness</div>
            <h3 style={h3}>{completeness}%</h3>
            <p style={muted}>
              {reqDone}/{REQUIRED_KEYS.length} required · {optDone}/{OPTIONAL_KEYS.length} optional
            </p>
          </div>
          <Progress value={completeness} />
        </div>
        <div style={{ marginTop: 16 }}>
          {!checks.fullName && <Pill>Full name</Pill>}
          {!checks.idNumber && <Pill>ID number</Pill>}
          {!checks.phone && <Pill>Phone</Pill>}
          {!checks.address && <Pill>Address</Pill>}
          {!checks.bankAccount && <Pill>Bank account</Pill>}
          {!checks.employmentStatus && <Pill>Employment</Pill>}
          {!checks.monthlyIncome && <Pill>Income</Pill>}
          {!checks.expenses && <Pill>Expenses</Pill>}
          {checks.consentCredit !== true && <Pill>Credit consent</Pill>}
        </div>
        <div style={{ marginTop: 16 }}>
          <Link to={nextStepHref} style={primaryBtn}>
            {completeness < 100 ? 'Continue onboarding' : 'Start a loan application'}
          </Link>
        </div>
      </Card>

      <Card>
        <div style={rowBetween}>
          <div>
            <div style={eyebrow}>Quick actions</div>
            <div style={grid3}>
              <Action to="/onboarding">Update profile</Action>
              <Action to="/new-loan">Apply for a loan</Action>
              <Action to="/borrower-dashboard">View my loans</Action>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <div style={rowBetween}>
          <div>
            <div style={eyebrow}>Verification</div>
            <p style={muted}>
              Status: <strong>{profile?.kycVerified ? 'Verified' : 'Pending'}</strong>
            </p>
          </div>
          {!profile?.kycVerified && (
            <Link to="/onboarding/identity" style={secondaryBtn}>Verify identity</Link>
          )}
        </div>
      </Card>
    </div>
  );
}

/* ---------- local UI bits (kept lightweight and consistent) --------------- */

function Card({ children }) {
  return (
    <section style={card}>
      {children}
    </section>
  );
}

function Avatar({ name }) {
  const initials = (name || '?')
    .split('@')[0]
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  return <div style={avatar}>{initials}</div>;
}

function Progress({ value }) {
  return (
    <div style={barWrap}>
      <div style={{ ...barFill, width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

function Action({ to, children }) {
  return (
    <Link to={to} style={actionBtn}>{children}</Link>
  );
}

function Skeleton() {
  return (
    <div style={stack}>
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} style={{ ...card, height: 120, background:
          'linear-gradient(90deg, #fff 0%, #f2f4f8 50%, #fff 100%)', backgroundSize: '200% 100%',
          animation: 'sh 1.2s ease-in-out infinite' }} />
      ))}
      <style>{`@keyframes sh {0%{background-position: 0% 0}100%{background-position: -200% 0}}`}</style>
    </div>
  );
}

/* ---------- styles -------------------------------------------------------- */
const stack = { display: 'grid', gap: 20 };
const rowBetween = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 };
const card = { background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.06)' };
const h2 = { margin: '6px 0 4px', fontSize: 22 };
const h3 = { margin: '6px 0 0', fontSize: 20 };
const eyebrow = { textTransform: 'uppercase', letterSpacing: 0.6, fontSize: 12, color: '#6b7280' };
const muted = { color: '#6b7280', marginTop: 4 };
const avatar = { width: 56, height: 56, borderRadius: 999, background: '#eef2ff', color: '#4A7CFF',
  display: 'grid', placeItems: 'center', fontWeight: 700 };
const barWrap = { width: 180, height: 10, background: '#eef2ff', borderRadius: 999, overflow: 'hidden' };
const barFill = { height: '100%', background: '#4A7CFF' };
const grid3 = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginTop: 8 };
const actionBtn = { display: 'inline-block', padding: '10px 14px', borderRadius: 10, background: '#f3f4f6', color: '#111827', textDecoration: 'none', fontWeight: 600 };
const primaryBtn = { display: 'inline-block', padding: '12px 16px', borderRadius: 10, background: '#4A7CFF', color: '#fff', textDecoration: 'none', fontWeight: 700 };
const secondaryBtn = { display: 'inline-block', padding: '10px 14px', borderRadius: 10, background: '#eef2ff', color: '#4A7CFF', textDecoration: 'none', fontWeight: 700 };
const Pill = ({ children }) => (
  <span style={{ display: 'inline-block', background: '#f3f4f6', borderRadius: 999, padding: '6px 10px', marginRight: 8, marginBottom: 8, fontSize: 12 }}>
    {children}
  </span>
);
