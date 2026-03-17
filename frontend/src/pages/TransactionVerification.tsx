import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { verificationApi } from '../api/verificationApi';
import { TransactionDetailDrawer } from '../components/verification/TransactionDetailDrawer';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { LoadingSpinner } from '../components/ui/LoadingSpinner';
import { useToast } from '../components/ui/Toast';
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

export const TransactionVerification: React.FC = () => {
  const { merchantId } = useParams<{ merchantId: string }>();
  const { addToast, ToastContainer } = useToast();
  
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
    let interval: number | null = null;
    
    if (autoRefresh) {
      interval = window.setInterval(() => {
        loadTransactions();
      }, 10000); // Refresh every 10 seconds
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
      const filters: any = {};
      if (statusFilter) filters.status = statusFilter;
      if (paymentMethodFilter) filters.payment_method = paymentMethodFilter;

      const data = await verificationApi.getMerchantTransactions(merchantIdNum, filters);
      setTransactions(data);
    } catch (error: any) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'Failed to load transactions'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const filterTransactions = () => {
    let filtered = transactions;

    if (searchTerm) {
      filtered = filtered.filter(transaction =>
        transaction.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.merchant_transaction_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        transaction.customer_email?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTransactions(filtered);
  };

  const getPaymentMethodIcon = (method: string) => {
    switch (method.toUpperCase()) {
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
    return new Date(dateString).toLocaleString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const statusOptions = ['', 'CREATED', 'INITIATED', 'PROCESSING', 'SUCCESS', 'FAILED', 'REFUNDED', 'SETTLED'];
  const paymentMethodOptions = ['', 'UPI', 'CARD', 'NETBANKING'];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Transaction Verification</h1>
          <p className="mt-2 text-gray-600">
            Merchant ID: {merchantIdNum} | Monitor and verify transaction status
          </p>
        </div>

        {/* Filters */}
        <Card className="p-6 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            {/* Search */}
            <div className="flex-1 min-w-64">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search by ID, merchant ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div className="min-w-40">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Statuses</option>
                {statusOptions.slice(1).map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            {/* Payment Method Filter */}
            <div className="min-w-40">
              <select
                value={paymentMethodFilter}
                onChange={(e) => setPaymentMethodFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Methods</option>
                {paymentMethodOptions.slice(1).map(method => (
                  <option key={method} value={method}>{method}</option>
                ))}
              </select>
            </div>

            {/* Auto Refresh Toggle */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="autoRefresh" className="text-sm text-gray-700">
                Auto-refresh
              </label>
            </div>

            {/* Refresh Button */}
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

        {/* Transactions Table */}
        <Card className="overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold">
              Transactions ({filteredTransactions.length})
            </h3>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
              <span className="ml-3 text-gray-600">Loading transactions...</span>
            </div>
          ) : filteredTransactions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No transactions found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Callback
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredTransactions.map((transaction) => (
                    <tr key={transaction.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 font-mono">
                            {transaction.id.substring(0, 8)}...
                          </div>
                          {transaction.merchant_transaction_id && (
                            <div className="text-xs text-gray-500">
                              {transaction.merchant_transaction_id}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-gray-900">
                          {formatAmount(transaction.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={transaction.status as any} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getPaymentMethodIcon(transaction.payment_method)}
                          <span className="text-sm text-gray-900">
                            {transaction.payment_method}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getCallbackStatusIcon(transaction.callback_sent)}
                          <span className="text-sm text-gray-600">
                            {transaction.callback_sent ? 'Sent' : 'Pending'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(transaction.created_at)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
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

      {/* Transaction Detail Drawer */}
      {selectedTransactionId && (
        <TransactionDetailDrawer
          transactionId={selectedTransactionId}
          isOpen={!!selectedTransactionId}
          onClose={() => setSelectedTransactionId(null)}
        />
      )}

      <ToastContainer />
    </div>
  );
};