// 5klippa-web/src/App.js

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage               from './pages/LoginPage';
import RegisterPage            from './pages/RegisterPage';
import DashboardPage           from './pages/DashboardPage';
import BorrowerDashboardPage   from './pages/BorrowerDashboardPage';
import NewLoanPage             from './pages/NewLoanPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                   element={<Navigate to="/login" replace />} />
        <Route path="/login"              element={<LoginPage />} />
        <Route path="/register"           element={<RegisterPage />} />
        <Route path="/dashboard"          element={<DashboardPage />} />
        <Route path="/borrower-dashboard" element={<BorrowerDashboardPage />} />
        <Route path="/new-loan"           element={<NewLoanPage />} />
      </Routes>
    </BrowserRouter>
  );
}
