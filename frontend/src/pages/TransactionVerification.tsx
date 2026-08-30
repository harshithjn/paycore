import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { verificationApi } from '../api/verificationApi';
import { TransactionDetailDrawer } from '../components/verification/TransactionDetailDrawer';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { Toast } from '../components/ui/Toast';
import type { Transaction } from '../types';
import {
  RefreshCw,
  Search,
  Eye,
  Shield,
  CreditCard,
  Smartphone,
  Building,
  CheckCircle,
  Clock
} from 'lucide-react';

export const TransactionVerification = () => {
  const { merchantId } = useParams<{ merchantId: string }>();
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedTransactionId, setSelectedTransactionId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(false);

  const merchantIdNum = merchantId ? parseInt(merchantId) : 1;

  useEffect(() => {
    loadTransactions();
  }, [merchantId]);

  useEffect(() => {
    filterTransactions();
  }, [transactions, searchTerm, statusFilter, paymentMethodFilter]);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (autoRefresh) {
      interval = setInterval(() => {
        loadTransactions();
      }, 10000);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [autoRefresh]);

  const loadTransactions = async () => {
    setIsLoading(true);
    try {
      const data = await verificationApi.getMerchantTransactions(merchantIdNum);
      setTransactions(data);
    } catch (error: any) {
      setToast({ message: 'Failed to load transactions', type: 'error' });
    } finally {
      setIsLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.merchantTransactionId?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter) {
      filtered = filtered.filter(t => t.status === statusFilter);
    }

    if (paymentMethodFilter) {
      filtered = filtered.filter(t => t.paymentMethod === paymentMethodFilter);
    }

    setFilteredTransactions(filtered);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method?.toUpperCase()) {
      case 'UPI':
        return <Smartphone className="w-4 h-4" />;
      case 'CARD':
        return <CreditCard className="w-4 h-4" />;
      case 'NETBANKING':
        return <Building className="w-4 h-4" />;
      default:
        return <CreditCard className="w-4 h-4" />;
    }
  };

  const getCallbackStatusIcon = (callbackSent?: boolean) => {
    if (callbackSent) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
    return <Clock className="w-4 h-4 text-gray-500" />;
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return dateString ? new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) : 'N/A';
  };

  const statusOptions = ['', 'CREATED', 'INITIATED', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED', 'SETTLED'];
  const paymentMethodOptions = ['', 'UPI', 'CARD', 'NETBANKING'];

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0B0B0C] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-medium text-[#111] dark:text-[#EAEAEA]">Transaction Verification</h1>
          <p className="mt-2 text-[#6B7280]">
            Merchant ID: {merchantIdNum} | Monitor and verify transaction status
          </p>
        </div>

        <Card className="p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#6B7280] w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by ID, merchant ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            <div className="min-w-40">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-field"
              >
                <option value="">All Statuses</option>
                {statusOptions.slice(1).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="min-w-40">
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="input-field"
              >
                <option value="">All Methods</option>
                {paymentMethodOptions.slice(1).map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-[#E5E7EB] dark:border-[#2A2A2A]"
              />
              <label htmlFor="autoRefresh" className="text-sm text-[#6B7280]">
                Auto-refresh
              </label>
            </div>

            <Button
              onClick={loadTransactions}
              disabled={isLoading}
              variant="outline"
              size="sm"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </Card>

        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E5E7EB] dark:border-[#2A2A2A]">
            <h3 className="text-lg font-medium text-[#111] dark:text-[#EAEAEA]">
              Transactions ({filteredTransactions.length})
            </h3>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-[#6B7280]">Loading transactions...</span>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-[#6B7280]">
              <Shield className="w-12 h-12 mx-auto mb-4" />
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-[#E5E7EB] dark:border-[#2A2A2A]">
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280]">Transaction</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280]">Amount</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280]">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280]">Method</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280]">Callback</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280]">Created</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-[#6B7280]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="table-row">
                      <td className="px-6 py-4">
                        <div>
                          <div className="text-sm font-medium text-[#111] dark:text-[#EAEAEA] font-mono">
                            {transaction.id.substring(0, 8)}...
                          </div>
                          {transaction.merchantTransactionId && (
                            <div className="text-xs text-[#6B7280]">
                              {transaction.merchantTransactionId}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-[#111] dark:text-[#EAEAEA]">
                          {formatAmount(transaction.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={transaction.status} />
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getPaymentMethodIcon(transaction.paymentMethod)}
                          <span className="text-sm text-[#111] dark:text-[#EAEAEA]">
                            {transaction.paymentMethod}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          {getCallbackStatusIcon(transaction.callbackSent)}
                          <span className="text-sm text-[#6B7280]">
                            {transaction.callbackSent ? 'Sent' : 'Pending'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-[#6B7280]">
                        {formatDate(transaction.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <Button
                          onClick={() => setSelectedTransactionId(transaction.id)}
                          variant="outline"
                          size="sm"
                        >
                          <Eye className="w-4 h-4 mr-1" />
                          Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      {selectedTransactionId && (
        <TransactionDetailDrawer
          transactionId={selectedTransactionId}
          isOpen={!!selectedTransactionId}
          onClose={() => setSelectedTransactionId(null)}
        />
      )}

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
};
