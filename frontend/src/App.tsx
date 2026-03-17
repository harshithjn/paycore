
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Payments } from './pages/Payments';
import { Refunds } from './pages/Refunds';
import { Settlements } from './pages/Settlements';
import { Reports } from './pages/Reports';
import { ApiKeys } from './pages/ApiKeys';
import { Settings } from './pages/Settings';
import { PaymentInitiation } from './pages/PaymentInitiation';
import { TransactionVerification } from './pages/TransactionVerification';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Routes>
          {/* Redirect root to default merchant dashboard */}
          <Route path="/" element={<Navigate to="/merchant/1/dashboard" replace />} />
          
          {/* Standalone Pages */}
          <Route path="/merchant/:merchantId/payment-initiation" element={<PaymentInitiation />} />
          <Route path="/merchant/:merchantId/verification" element={<TransactionVerification />} />
          
          {/* Merchant routes */}
          <Route path="/merchant/:merchantId" element={<DashboardLayout />}>
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="payments" element={<Payments />} />
            <Route path="refunds" element={<Refunds />} />
            <Route path="settlements" element={<Settlements />} />
            <Route path="reports" element={<Reports />} />
            <Route path="api-keys" element={<ApiKeys />} />
            <Route path="settings" element={<Settings />} />
            
            {/* Default redirect to dashboard */}
            <Route index element={<Navigate to="dashboard" replace />} />
          </Route>
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/merchant/1/dashboard" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;