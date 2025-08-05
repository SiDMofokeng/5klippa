// 5klippa-web/src/App.js

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Placeholder pages (we'll flesh them out next)
function LoginPage() {
  return <h1>Login Page</h1>;
}
function RegisterPage() {
  return <h1>Register Page</h1>;
}
function DashboardPage() {
  return <h1>Dashboard</h1>;
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
      </Routes>
    </BrowserRouter>
  );
}
