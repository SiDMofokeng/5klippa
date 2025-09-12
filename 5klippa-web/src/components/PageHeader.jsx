// 5klippa-web/src/components/PageHeader.jsx
import React from 'react';

export default function PageHeader({ title, children }) {
  const wrap = {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16,
  };
  const h2 = { margin: 0, fontSize: 22, fontWeight: 700, color: '#1f274d' };

  return (
    <div style={wrap}>
      <h2 style={h2}>{title}</h2>
      <div>{children}</div>
    </div>
  );
}
