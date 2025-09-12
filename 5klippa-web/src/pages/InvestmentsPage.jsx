// 5klippa-web/src/pages/InvestmentsPage.jsx
import React from 'react';
import DashboardLayout from '../components/DashboardLayout';
import PageHeader from '../components/PageHeader';

export default function InvestmentsPage() {
  const card = {
    background: '#fff', borderRadius: 16, boxShadow: '0 8px 30px rgba(16,24,40,0.08)', padding: 24,
  };
  const hint = { color: '#475569' };

  return (
    <DashboardLayout>
      <PageHeader title="Investments" />
      <div style={card}>
        <div style={hint}>Coming soon.</div>
      </div>
    </DashboardLayout>
  );
}
