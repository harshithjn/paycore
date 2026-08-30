import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { transactionApi } from '../api/transactionApi';
import type { Transaction, TransactionStatusData } from '../types';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/ui/StatusBadge';
import { X } from 'lucide-react';

export const Transactions = () => {
  const { merchantId } = useParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTxn, setSelectedTxn] = useState<TransactionStatusData | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);

  const fetchTransactions = async () => {
    if (!merchantId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await transactionApi.getAll(Number(merchantId));
      setTransactions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const fetchTransactionDetails = async (txnId: string) => {
    setDetailsLoading(true);
    try {
      const details = await transactionApi.getStatusWithDetails(txnId);
      setSelectedTxn(details);
    } catch (err) {
      console.error('Failed to load transaction details:', err);
    } finally {
      setDetailsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [merchantId]);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-medium text-[#111] dark:text-[#EAEAEA] mb-6">Transactions</h1>
        <div className="card p-6">
          <LoadingSkeleton rows={8} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-medium text-[#111] dark:text-[#EAEAEA] mb-6">Transactions</h1>
        <div className="card p-6">
          <ErrorState message={error} onRetry={fetchTransactions} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-medium text-[#111] dark:text-[#EAEAEA]">Transactions</h1>
        <button onClick={fetchTransactions} className="btn-secondary text-sm">
          Refresh
        </button>
      </div>

      <div className="card">
        {transactions.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No transactions yet"
              description="Transactions will appear here once payments are initiated"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB] dark:border-[#2A2A2A]">
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Transaction ID</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Method</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Status</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Customer</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Date</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((txn) => (
                  <tr key={txn.id} className="table-row">
                    <td className="py-3 px-4 text-sm text-[#111] dark:text-[#EAEAEA] font-mono">
                      {txn.id.substring(0, 8)}...
                    </td>
                    <td className="py-3 px-4 text-sm font-medium text-[#111] dark:text-[#EAEAEA]">
                      ₹{txn.amount.toFixed(2)}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#6B7280]">
                      {txn.paymentMethod}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={txn.status} />
                    </td>
                    <td className="py-3 px-4 text-sm text-[#6B7280]">
                      {txn.customerEmail || txn.customerPhone || '-'}
                    </td>
                    <td className="py-3 px-4 text-sm text-[#6B7280]">
                      {txn.createdAt ? new Date(txn.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => fetchTransactionDetails(txn.id)}
                        className="text-sm text-[#4F46E5] hover:text-[#4338CA] transition-colors duration-150"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedTxn && (
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-end">
          <div
            className="w-full max-w-2xl h-full bg-white dark:bg-[#111] shadow-2xl overflow-y-auto animate-slide-in"
            style={{ animation: 'slideIn 200ms ease-out' }}
          >
            <div className="sticky top-0 bg-white dark:bg-[#111] border-b border-[#E5E7EB] dark:border-[#2A2A2A] p-6 flex items-center justify-between">
              <h2 className="text-xl font-medium text-[#111] dark:text-[#EAEAEA]">Transaction Details</h2>
              <button onClick={() => setSelectedTxn(null)} className="p-2 hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1A] rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {detailsLoading ? (
                <LoadingSkeleton rows={6} />
              ) : (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-[#6B7280] mb-3">Transaction Information</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-[#6B7280]">ID</span>
                        <span className="text-sm text-[#111] dark:text-[#EAEAEA] font-mono">{selectedTxn.transaction.id}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-[#6B7280]">Amount</span>
                        <span className="text-sm font-medium text-[#111] dark:text-[#EAEAEA]">₹{selectedTxn.transaction.amount.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-[#6B7280]">Status</span>
                        <StatusBadge status={selectedTxn.transaction.status} />
                      </div>
                      <div className="flex justify-between py-2">
                        <span className="text-sm text-[#6B7280]">Payment Method</span>
                        <span className="text-sm text-[#111] dark:text-[#EAEAEA]">{selectedTxn.transaction.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  {selectedTxn.stateTransitions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-[#6B7280] mb-3">Timeline</h3>
                      <div className="space-y-3">
                        {selectedTxn.stateTransitions.map((st) => (
                          <div key={st.id} className="flex items-start gap-3">
                            <div className="w-2 h-2 rounded-full bg-[#4F46E5] mt-1.5" />
                            <div className="flex-1">
                              <div className="text-sm text-[#111] dark:text-[#EAEAEA]">
                                {st.fromStatus && `${st.fromStatus} → `}{st.toStatus}
                              </div>
                              <div className="text-xs text-[#6B7280] mt-1">
                                {st.transitionedAt ? new Date(st.transitionedAt).toLocaleString() : 'N/A'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedTxn.callbackLogs.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-[#6B7280] mb-3">Callback Status</h3>
                      <div className="text-sm text-[#111] dark:text-[#EAEAEA]">
                        {selectedTxn.transaction.callbackSent ? 'Callback sent successfully' : 'Pending'}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
};
