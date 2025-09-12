// 5klippa-web/src/App.js
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

import DashboardPage from './pages/DashboardPage';
import LoansPage from './pages/LoansPage';
import InvestmentsPage from './pages/InvestmentsPage';
import WalletPage from './pages/WalletPage';
import ProfilePage from './pages/ProfilePage';
import ReferralPage from './pages/ReferralPage';
import LoanDetailPage from './pages/LoanDetailPage';
import NewLoanPage from './pages/NewLoanPage';

import OnboardingLayout from './onboarding/OnboardingLayout';
import { OnboardingProvider } from './onboarding/OnboardingContext';
import AccountStep from './onboarding/steps/AccountStep';
import IdentityStep from './onboarding/steps/IdentityStep';
import ContactStep from './onboarding/steps/ContactStep';
import FinancialStep from './onboarding/steps/FinancialStep';
import RolesConsentStep from './onboarding/steps/RolesConsentStep';
import DoneStep from './onboarding/steps/DoneStep';

// NEW admin imports
import AdminLoginPage from './pages/admin/AdminLoginPage';
import AdminShell from './pages/admin/AdminShell';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';

import AdminPage from './pages/admin/AdminPage';
import AdminApplicationsPage from './pages/admin/AdminApplicationsPage';
import AdminReferralsPage from './pages/admin/AdminReferralsPage';
import AdminWalletPage from './pages/admin/AdminWalletPage';
import AdminSettingsPage from './pages/admin/AdminSettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        <Route path="/admin" element={<AdminPage />} />

        {/* App pages (each page does its own auth check) */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/loans" element={<LoansPage />} />
        <Route path="/loans/:id" element={<LoanDetailPage />} />
        <Route path="/new-loan" element={<NewLoanPage />} />
        <Route path="/investments" element={<InvestmentsPage />} />
        <Route path="/wallet" element={<WalletPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/referrals" element={<ReferralPage />} />

        {/* Onboarding (public entry, steps redirect internally if signed in) */}
        <Route
          path="/onboarding"
          element={
            <OnboardingProvider>
              <OnboardingLayout />
            </OnboardingProvider>
          }
        >
          <Route index element={<AccountStep />} />
          <Route path="identity" element={<IdentityStep />} />
          <Route path="contact" element={<ContactStep />} />
          <Route path="financial" element={<FinancialStep />} />
          <Route path="roles" element={<RolesConsentStep />} />
          <Route path="done" element={<DoneStep />} />
        </Route>

        {/* NEW: admin area */}
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin" element={<AdminShell />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="users" element={<AdminUsersPage />} />
          <Route path="applications" element={<AdminApplicationsPage />} />
          <Route path="referrals" element={<AdminReferralsPage />} />
          <Route path="wallets" element={<AdminWalletPage />} />
          <Route path="settings" element={<AdminSettingsPage />} />
          {/* Future pages:
              
          */}
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
