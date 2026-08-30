import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';

import { Refunds } from './pages/Refunds';
import { Settlements } from './pages/Settlements';
import { Reports } from './pages/Reports';
import { ApiKeys } from './pages/ApiKeys';
import { Settings } from './pages/Settings';
import { PaymentInitiation } from './pages/PaymentInitiation';
import { TransactionVerification } from './pages/TransactionVerification';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { CustomerPayment } from './pages/CustomerPayment';
import { LandingPage } from './pages/LandingPage';
import { DeveloperPortal } from './pages/DeveloperPortal.tsx';
import { PaymentLinkCheckout } from './pages/PaymentLinkCheckout.tsx';
import { NotFound } from './pages/NotFound';
import { Analytics } from '@vercel/analytics/react';

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Analytics />
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route path="/" element={<LandingPage />} />

          <Route path="/pay/:transactionId" element={<CustomerPayment />} />
          <Route path="/pay/link/:linkCode" element={<PaymentLinkCheckout />} />

          <Route path="/merchant/:merchantId/payment-initiation" element={<PaymentInitiation />} />
          <Route path="/merchant/:merchantId/verification" element={<TransactionVerification />} />

          <Route path="/merchant/:merchantId" element={<DashboardLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="payments" element={<PaymentInitiation />} />
            <Route path="refunds" element={<Refunds />} />
            <Route path="settlements" element={<Settlements />} />
            <Route path="reports" element={<Reports />} />
            <Route path="api-keys" element={<ApiKeys />} />
            <Route path="developer" element={<DeveloperPortal />} />
            <Route path="settings" element={<Settings />} />

            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
