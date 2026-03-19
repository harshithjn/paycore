import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { StatusBadge, type Status } from '../ui/StatusBadge';
import { Button } from '../ui/Button';
import { CallbackLogs } from '../callback/CallbackLogs';
import { CreditCard, Smartphone, Building, Eye, RefreshCw } from 'lucide-react';

interface Transaction {
  id: string;
  merchantId: number;
  amount: number;
  status: string;
  paymentMethod: string;
  merchantTransactionId?: string;
  customerEmail?: string;
  failureReason?: string;
  upiTransactionId?: string;
  callbackSent?: boolean;
  verificationAttempts?: number;
  createdAt: string;
  updatedAt: string;
}

interface EnhancedTransactionListProps {
  merchantId: string;
}

export const EnhancedTransactionList: React.FC<EnhancedTransactionListProps> = ({ merchantId }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(null);
  const [showCallbackLogs, setShowCallbackLogs] = useState(false);

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 5000); // Auto-refresh every 5 seconds
    return () => clearInterval(interval);
  }, [merchantId]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8081/api/payment/merchant/${merchantId}/transactions`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
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

  const getStatusVariant = (status: string): Status => {
    switch (status) {
      case 'SUCCESS': return 'SUCCESS';
      case 'FAILED': return 'FAILED';
      case 'PROCESSING': return 'PROCESSING';
      case 'CREATED': return 'CREATED';
      case 'INITIATED': return 'INITIATED';
      default: return 'CREATED';
    }
  };

  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const handleViewCallbacks = (transactionId: string) => {
    setSelectedTransaction(transactionId);
    setShowCallbackLogs(true);
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold">Transaction History</h2>
          <Button
            onClick={fetchTransactions}
            disabled={loading}
            size="sm"
            variant="outline"
            className="flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Loading...' : 'Refresh'}
          </Button>
        </div>

        {loading && transactions.length === 0 ? (
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading transactions...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No transactions found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Transaction</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Method</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Callback Status</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                  <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div className="font-mono text-sm text-gray-600">
                        {transaction.id.substring(0, 8)}...
                      </div>
                      {transaction.merchantTransactionId && (
                        <div className="text-xs text-gray-500">
                          Merchant: {transaction.merchantTransactionId}
                        </div>
                      )}
                      {transaction.upiTransactionId && (
                        <div className="text-xs text-green-600">
                          UPI: {transaction.upiTransactionId}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold">
                        {formatAmount(transaction.amount)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        {getPaymentMethodIcon(transaction.paymentMethod)}
                        <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                          {transaction.paymentMethod}
                        </span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge
                        status={getStatusVariant(transaction.status)}
                      />
                      {transaction.failureReason && (
                        <div className="text-xs text-red-600 mt-1 max-w-xs truncate">
                          {transaction.failureReason}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-col gap-1">
                        {transaction.callbackSent === true ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                            ✓ Callback Sent
                          </span>
                        ) : transaction.callbackSent === false ? (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                            ✗ Callback Failed
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-800">
                            - No Callback
                          </span>
                        )}
                        {transaction.verificationAttempts && transaction.verificationAttempts > 0 && (
                          <span className="text-xs text-gray-500">
                            {transaction.verificationAttempts} verification{transaction.verificationAttempts > 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-sm text-gray-600">
                        {formatDate(transaction.createdAt)}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <Button
                        onClick={() => handleViewCallbacks(transaction.id)}
                        size="sm"
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        <Eye className="w-3 h-3" />
                        View Logs
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {showCallbackLogs && selectedTransaction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200 flex justify-between items-center sticky top-0 bg-white">
              <h3 className="text-lg font-semibold">
                Callback Logs - Transaction {selectedTransaction.substring(0, 8)}...
              </h3>
              <Button
                onClick={() => setShowCallbackLogs(false)}
                variant="outline"
                size="sm"
              >
                Close
              </Button>
            </div>
            <div className="p-4">
              <CallbackLogs transactionId={selectedTransaction} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};