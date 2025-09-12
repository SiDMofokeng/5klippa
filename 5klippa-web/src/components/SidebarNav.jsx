// 5klippa-web/src/components/SidebarNav.jsx
import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import theme from '../theme';

export default function SidebarNav() {
  const nav = useNavigate();
  const { pathname } = useLocation();

  const items = [
    { label: 'Overview',      path: '/dashboard' },
    { label: 'Apply for Loan', path: '/new-loan' },
    { label: 'My Loans',       path: '/borrower-dashboard' },
    // These two can be wired later — keeping visible for layout parity:
    { label: 'Wallet',         path: null, disabled: true },
    { label: 'Profile',        path: '/onboarding' }, // takes you to edit details for now
    { label: 'Support',        path: null, disabled: true },
  ];

  const go = (item) => {
    if (item.disabled) return;
    if (item.path) nav(item.path);
  };

  return (
    <div style={navWrap}>
      <nav style={navList}>
        {items.map((item) => {
          const active = item.path && pathname.startsWith(item.path);
          return (
            <button
              key={item.label}
              onClick={() => go(item)}
              disabled={item.disabled}
              style={{
                ...navBtn,
                ...(active ? navBtnActive : {}),
                ...(item.disabled ? navBtnDisabled : {}),
              }}
            >
              {item.label}
            </button>
          );
        })}
      </nav>

      <button
        onClick={async () => { await signOut(auth); nav('/login'); }}
        style={logoutBtn}
      >
        Logout
      </button>
    </div>
  );
}

const navWrap = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
};

const navList = {
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
  padding: '8px 6px',
  overflowY: 'auto',
};

const navBtn = {
  textAlign: 'left',
  background: 'transparent',
  color: 'rgba(255,255,255,0.92)',
  border: 'none',
  borderRadius: 10,
  padding: '10px 12px',
  fontSize: 15,
  cursor: 'pointer',
};

const navBtnActive = {
  background: 'rgba(255,255,255,0.16)',
  color: '#fff',
  fontWeight: 600,
};

const navBtnDisabled = {
  opacity: 0.5,
  cursor: 'default',
};

const logoutBtn = {
  marginTop: 'auto',
  background: '#ffffff1f',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  padding: '10px 12px',
  fontSize: 14,
  cursor: 'pointer',
  alignSelf: 'flex-start',
};
