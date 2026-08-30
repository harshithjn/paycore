import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { transactionApi } from '../api/transactionApi';
import { refundApi, type RefundRequest, type RefundResponse } from '../api/refundApi';
import type { Transaction } from '../types';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { ErrorState } from '../components/ui/ErrorState';
import { EmptyState } from '../components/ui/EmptyState';
import { StatusBadge } from '../components/ui/StatusBadge';
import { Toast } from '../components/ui/Toast';
import { X } from 'lucide-react';

export const Refunds = () => {
  const { merchantId } = useParams();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [refunds, setRefunds] = useState<RefundResponse[]>([]);
  const [remainingAmount, setRemainingAmount] = useState<number>(0);
  const [refundLoading, setRefundLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const [refundForm, setRefundForm] = useState({
    amount: '',
    type: 'PARTIAL' as 'FULL' | 'PARTIAL',
    reason: '',
  });

  const fetchTransactions = async () => {
    if (!merchantId) return;

    setLoading(true);
    setError(null);

    try {
      const data = await transactionApi.getAll(Number(merchantId));
      const refundable = data.filter(t => t.status === 'SUCCESS' || t.status === 'SETTLED');
      setTransactions(refundable);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const openRefundModal = async (txn: Transaction) => {
    setSelectedTxn(txn);
    setRefundForm({ amount: txn.amount.toString(), type: 'FULL', reason: '' });

    try {
      const [refundList, remaining] = await Promise.all([
        refundApi.getRefundsByTransaction(txn.id),
        refundApi.getRemainingAmount(txn.id),
      ]);
      setRefunds(refundList);
      setRemainingAmount(remaining.remainingAmount);
    } catch (err) {
      console.error('Failed to load refund data:', err);
    }
  };

  const handleRefund = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedTxn) return;

    setRefundLoading(true);

    try {
      const request: RefundRequest = {
        transactionId: selectedTxn.id,
        amount: parseFloat(refundForm.amount),
        type: refundForm.type,
        reason: refundForm.reason || undefined,
      };

      const response = await refundApi.processRefund(request);

      if (response.status === 'COMPLETED') {
        setToast({ message: 'Refund processed successfully', type: 'success' });
        setSelectedTxn(null);
        fetchTransactions();
      } else {
        setToast({ message: response.message || 'Refund failed', type: 'error' });
      }
    } catch (err) {
      setToast({
        message: err instanceof Error ? err.message : 'Failed to process refund',
        type: 'error'
      });
    } finally {
      setRefundLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [merchantId]);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-medium text-[#111] dark:text-[#EAEAEA] mb-6">Refunds</h1>
        <div className="card p-6">
          <LoadingSkeleton rows={6} />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-medium text-[#111] dark:text-[#EAEAEA] mb-6">Refunds</h1>
        <div className="card p-6">
          <ErrorState message={error} onRetry={fetchTransactions} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-medium text-[#111] dark:text-[#EAEAEA] mb-6">Refunds</h1>

      <div className="card">
        {transactions.length === 0 ? (
          <div className="p-6">
            <EmptyState
              title="No refundable transactions"
              description="Only successful transactions can be refunded"
            />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#E5E7EB] dark:border-[#2A2A2A]">
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Transaction ID</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Amount</th>
                  <th className="text-left py-3 px-4 text-xs font-medium text-[#6B7280]">Status</th>
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
                    <td className="py-3 px-4">
                      <StatusBadge status={txn.status} />
                    </td>
                    <td className="py-3 px-4 text-sm text-[#6B7280]">
                      {txn.createdAt ? new Date(txn.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="py-3 px-4">
                      <button
                        onClick={() => openRefundModal(txn)}
                        className="text-sm text-[#4F46E5] hover:text-[#4338CA] transition-colors duration-150"
                      >
                        Refund
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
        <div className="fixed inset-0 bg-black bg-opacity-30 z-50 flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#111] rounded-lg shadow-2xl">
            <div className="border-b border-[#E5E7EB] dark:border-[#2A2A2A] p-6 flex items-center justify-between">
              <h2 className="text-xl font-medium text-[#111] dark:text-[#EAEAEA]">Process Refund</h2>
              <button onClick={() => setSelectedTxn(null)} className="p-2 hover:bg-[#F9FAFB] dark:hover:bg-[#1A1A1A] rounded-lg transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-6 p-4 bg-[#F9FAFB] dark:bg-[#1A1A1A] rounded-lg">
                <div className="flex justify-between mb-2">
                  <span className="text-sm text-[#6B7280]">Transaction Amount</span>
                  <span className="text-sm font-medium text-[#111] dark:text-[#EAEAEA]">₹{selectedTxn.amount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-[#6B7280]">Remaining Refundable</span>
                  <span className="text-sm font-medium text-[#059669]">₹{remainingAmount.toFixed(2)}</span>
                </div>
              </div>

              {refunds.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-[#6B7280] mb-2">Previous Refunds</h3>
                  <div className="space-y-2">
                    {refunds.map((refund) => (
                      <div key={refund.refundId} className="flex justify-between text-sm">
                        <span className="text-[#6B7280]">{refund.type}</span>
                        <span className="text-[#111] dark:text-[#EAEAEA]">₹{refund.amount.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleRefund} className="space-y-4">
                <div>
                  <label className="block text-sm text-[#6B7280] mb-2">Refund Type</label>
                  <select
                    value={refundForm.type}
                    onChange={(e) => setRefundForm({ ...refundForm, type: e.target.value as 'FULL' | 'PARTIAL' })}
                    className="input-field"
                  >
                    <option value="FULL">Full Refund</option>
                    <option value="PARTIAL">Partial Refund</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm text-[#6B7280] mb-2">Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={refundForm.amount}
                    onChange={(e) => setRefundForm({ ...refundForm, amount: e.target.value })}
                    className="input-field"
                    max={remainingAmount}
                  />
                </div>

                <div>
                  <label className="block text-sm text-[#6B7280] mb-2">Reason</label>
                  <textarea
                    value={refundForm.reason}
                    onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                    className="input-field"
                    rows={3}
                    placeholder="Optional reason for refund"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSelectedTxn(null)}
                    className="btn-secondary flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={refundLoading}
                    className="btn-primary flex-1"
                  >
                    {refundLoading ? 'Processing...' : 'Process Refund'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
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
